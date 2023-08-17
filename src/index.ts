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

				console.log("lastUsedServerIndex: " + this.#lastUsedServerIndex);
				const server = await this.#chooseServer(this.#serverList);

				const response = await this.#sendRequestToServer(server);
				console.log(response);

				if (response) {
					res.end(JSON.stringify(await this.#clientResponse(response)));
				}
			});
		});
	}

	async #sendRequestToServer(server: IServerInfo) {
		console.log(server);
		console.log(this.#clientRequestData);

		const FAKE_URL = `https://jsonplaceholder.typicode.com/todos/1`;

		const URL = `http://${server.host}:${server.port}${
			this.#clientRequestData.path
		}`;

		console.log(URL);

		let serverResponded = false;

		try {
			server.activeConnections = server.activeConnections + 1;
			const response = await fetch(URL, {
				method: this.#clientRequestData.method,
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

	async #clientResponse(response: http.IncomingMessage | string | {}) {
		return response;
	}

	async #chooseServer(servers: IServerInfo[]) {
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
		console.log(host);
		this.#lbServer.listen(Number(port), host, undefined, cb);
	}
}
