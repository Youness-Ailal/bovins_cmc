import { io, Socket } from "socket.io-client";
import { API_URL } from "./config";

let socket: Socket | null = null;

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      transports: ["websocket"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
