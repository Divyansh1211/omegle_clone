import { Socket } from "socket.io";

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// app.get("/", (req: Request, res: Response) => {
//   Response.json({ message: "Hello World" });
// });

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
