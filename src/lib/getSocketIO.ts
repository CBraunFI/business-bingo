import { Server as ServerIO } from 'socket.io';

let io: ServerIO | null = null;

export function setSocketIO(socketIO: ServerIO) {
  io = socketIO;
}

export function getSocketIO(): ServerIO | null {
  return io;
}