import { Socket } from "socket.io";
import express from "express";
import { UserManager } from "./manager/userManager";
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userManager = new UserManager();

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  userManager.addUser("name", socket);
  socket.on("disconnect", ()=>{
    userManager.removeUser(socket);
  })
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
