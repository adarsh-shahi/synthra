import http from "http";

interface IConfiguration {
	address: { host: string; port: number };
}

interface IServerInfo {
	host: string;
	port: number;
	isHealthy: boolean;
	id: number;
	activeConnections: number;
}

interface IClientRequest {
	ip: string;
	path: string;
	method: string;
	body: string;
}

interface IAlgoType {
	algo: "round-robin" | "least-connection" | "source-ip-hash" | "";
}

export default class Server {
	#lastUsedServerIndex: number = -1; // server to use (from available list) in round-robin fashion
	#serverList: IServerInfo[] = [];
	#lbServer: http.Server;
	#lbServerPort: number = 0;
	#lbRequest: http.IncomingMessage | null = null;
	#lbResponse: http.ServerResponse | null = null;
	#clientRequestData: IClientRequest = {
		ip: "",
		path: "",
		method: "",
		body: "",
	};
	#loadBalancerCofiguration: IAlgoType = { algo: "" };

	constructor(configure: IAlgoType) {
		this.#loadBalancerCofiguration.algo = configure.algo;
		this.#lbServer = http.createServer((req, res) => {
			this.#lbRequest = req;
			this.#lbResponse = res;
			console.log(req.headers);
			let body = "";
			req.on("data", (chunk) => {
				body += chunk;
			});
			req.on("end", async () => {
				this.#clientRequestData = {
					ip: req.url!,
					path: req.url!,
					method: req.method!,
					body,
				};
				console.log(this.#lbServer.address());

				console.log("lastUsedServerIndex: " + this.#lastUsedServerIndex);
				const server = await this.#chooseServer();

				const responseData = await this.#sendRequestToServer(server);
				console.log(responseData);

				if (responseData) {
					res.setHeader("Access-Control-Allow-Origin", "*");
					res.setHeader(
						"Access-Control-Allow-Methods",
						"GET, POST, PUT, DELETE, OPTIONS"
					);
					res.end(await this.#clientResponse(responseData));
				}
			});
		});
	}
	#setHeadersForServerRequest() {
		const protocol = `${
			this.#lbRequest?.headers.origin?.at(4) === "s" ? "https" : "http"
		}`;
		const host = this.#lbRequest?.headers.origin?.slice(12);
		const headers = {
			"X-Forwarded-Proto": `${protocol}`,
			"X-Forwarded-Port": `${this.#lbServerPort}`,
			"X-Forwarded-Host": `${host}`, //ignoring  https://www.
			"X-Forwarded-For": `${this.#lbRequest?.socket.remoteAddress}`,
		};
		return headers;
	}
	async #sendRequestToServer(server: IServerInfo) {
		const FAKE_URL = `https://jsonplaceholder.typicode.com/todos/1`;

		const URL = `http://${server.host}:${server.port}${
			this.#clientRequestData.path
		}`;

		let serverResponded = false;

		try {
			server.activeConnections = server.activeConnections + 1;
			const response = await fetch(URL, {
				method: this.#clientRequestData.method,
				headers: this.#setHeadersForServerRequest(),
			});

			server.activeConnections = server.activeConnections - 1;
			serverResponded = true;
			return await response.text();
		} catch (e) {
			if (!serverResponded)
				server.activeConnections = server.activeConnections - 1;
			console.log(e);
		}
	}

	async #clientResponse(responseData: string) {
		return responseData;
	}

	async #chooseServer() {
		if (this.#loadBalancerCofiguration.algo === "round-robin") {
			this.#lastUsedServerIndex++;
			if (this.#lastUsedServerIndex === this.#serverList.length)
				this.#lastUsedServerIndex = 0;
			return this.#serverList[this.#lastUsedServerIndex];
		} else if (this.#loadBalancerCofiguration.algo === "least-connection") {
			let leastActiveConnectionServer = this.#serverList[0];
			for (let i = 1; i < this.#serverList.length; i++) {
				if (
					leastActiveConnectionServer.activeConnections >
					this.#serverList[i].activeConnections
				) {
					leastActiveConnectionServer = this.#serverList[i];
				}
			}
			this.#lastUsedServerIndex = leastActiveConnectionServer.id;
			return leastActiveConnectionServer;
		} else return this.#serverList[0];
	}

	add(server: IConfiguration) {
		const { port, host } = server.address;
		this.#serverList.push({
			port,
			host,
			isHealthy: true,
			id: this.#serverList.length,
			activeConnections: 0,
		});
	}

	listen(obj: { port: string | number; host?: string }, cb: () => void) {
		const { host, port } = obj;

		if (!Number(port)) {
			throw new Error("Argument 1 (PORT) should contain a numeric value");
		}
		this.#lbServerPort = Number(port);
		console.log(host);
		this.#lbServer.listen(Number(port), host, undefined, cb);
	}
}
