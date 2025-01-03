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
    const roomId = GLOBAL_ROOM_ID;
    this.rooms.set(roomId, { user1, user2 });
    user1?.socket.emit("send-offer", { roomId });
  }

  onOffer(roomId: string, sdp: string) {
    const user2 = this.rooms.get(roomId)?.user1;
    user2?.socket.emit("offer", {
      sdp,
    });
  }

  onAnswer(roomId: string, sdp: string) {
    const user1 = this.rooms.get(roomId)?.user1;
    user1?.socket.emit("answer", {
      sdp,
    });
  }

  generate() {
    GLOBAL_ROOM_ID = Math.random().toString(36).substring(7);
  }
}
