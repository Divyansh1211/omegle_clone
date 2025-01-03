import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface Users {
  name: string;
  socket: Socket;
}

export class UserManager {
  private users: Users[];
  private queue: string[];
  private roomManager: RoomManager;
  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, socket: Socket) {
    this.users.push({ name, socket });
    this.queue.push(socket.id);
    socket.send("lobby");
    this.clearQueue();
    this.initHandlers(socket);
  }

  removeUser(socket: Socket) {
    const user = this.users.find((x) => x.socket.id === socket.id);
    this.users = this.users.filter((user) => user.socket.id !== socket.id);
    this.queue = this.queue.filter((id) => id === socket.id);
  }

  clearQueue() {
    if (this.queue.length < 2) return;
    const id1 = this.queue.pop();
    const id2 = this.queue.pop();
    const user1 = this.users.find((x) => x.socket.id === id1);
    const user2 = this.users.find((x) => x.socket.id === id2);
    if (!user1 || !user2) return;
    const room = this.roomManager.createRoom(user1, user2);
  }

  initHandlers(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onOffer(roomId, sdp,socket.id);
    });
    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      this.roomManager.onAnswer(roomId, sdp,socket.id);
    });
    socket.on("add-ice-candidate", ({ candidate, roomId ,type}) => {
      this.roomManager.onIceCandidate(roomId, socket.id, candidate, type);
    });
  }
}
