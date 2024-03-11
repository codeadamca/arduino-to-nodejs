import { createServer } from "http";
import { readFileSync } from "fs";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { Server as SocketIOServer } from "socket.io";

const index = readFileSync("index.html");
const port = new SerialPort({ path: "/dev/cu.usbmodem101", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const app = createServer(function (_req, res) {
	res.writeHead(200, { "Content-Type": "text/html" });
	res.end(index);
});

// Specify the CORS options
const io = new SocketIOServer(app, {
	cors: {
		origin: "*", // Replace with the domain you want to make requests from
		methods: ["GET", "POST"], // Allowed request methods
		// allowedHeaders: ["my-custom-header"], // Custom headers here
		credentials: true, // Allow credentials (cookies, session IDs)
	},
});

io.on("connection", () => console.log("Node is listening to port"));

parser.on("data", (data) => {
    // console.log(data);
	io.emit("data", data);
});

app.listen(3000);
