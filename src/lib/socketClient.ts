'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocketClient(token: string): Socket {
  if (socket?.connected) {
    socket.disconnect();
  }

  socket = io({
    path: '/api/socket',
    auth: {
      token
    }
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}