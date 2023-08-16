import Server from "../src";
const server = new Server({ algo: "round-robin" });

const PORT = process.env.PORT || 3000;

server.add({
	address: {
		port: 5000,
		host: "172.29.0.1",
	},
});
server.add({
	address: {
		port: 8000,
		host: "172.30.0.1",
	},
});
server.add({
	address: {
		port: 9000,
		host: "172.31.0.1",
	},
});

server.listen(
	{
		port: PORT,
		// host: "127.0.0.1",
	},
	() => {
		console.log(`server listening on port ${PORT}`);
	}
);
