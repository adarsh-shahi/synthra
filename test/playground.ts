import Server from "../src";
const server = new Server({ algo: "least-connection" });

const PORT = process.env.PORT || 3000;

server.add({
	address: {
		port: 5000,
		host: "172.19.0.1",
	},
});
server.add({
	address: {
		port: 8000,
		host: "172.20.0.1",
	},
});
server.add({
	address: {
		port: 9000,
		host: "172.21.0.1",
	},
});

server.listen(
	{
		port: PORT,
	},
	() => {
		console.log(`server listening on port ${PORT}`);
	}
);
