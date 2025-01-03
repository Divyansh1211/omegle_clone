import { Users } from "./userManager";

let GLOBAL_ROOM_ID = "";

interface Room {
  user1: Users;
  user2: Users;
}

export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map();
  }

  createRoom(user1: Users, user2: Users) {
    const roomId = this.generate();
    this.rooms.set(roomId, { user1, user2 });
    user1?.socket.emit("send-offer", { roomId });
  }

  onOffer(roomId: string, sdp: string,socketId : string) {
    
    const room = this.rooms.get(roomId)
    if(!room){
      return;
    }
    const receivingUser = room.user1.socket.id === socketId ? room.user2 : room.user1;
    // const user2 = this.rooms.get(roomId)?.user2;
    receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }
  
  onAnswer(roomId: string, sdp: string, socketId: string) {
    const room = this.rooms.get(roomId)
    if(!room){
      return;
    }
    const receivingUser = room.user1.socket.id === socketId ? room.user2 : room.user1;
    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  onIceCandidate(roomId: string, senderSocketId: string, candidate: any, type: "sender"| "receiver") {
    const room = this.rooms.get(roomId)
    if(!room){
      return;
    }
    const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    receivingUser.socket.emit("add-ice-candidate", ({candidate, type}));
  }


  generate() {
    return (GLOBAL_ROOM_ID = Math.random().toString(36).substring(7));
  }
}
