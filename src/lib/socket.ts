import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { verifyToken } from './auth';
import { setSocketIO } from './getSocketIO';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export interface SocketData {
  gameId?: string;
  playerId?: string;
  email?: string;
  type?: 'player' | 'admin';
}

export function initializeSocket(server: NetServer): ServerIO {
  const io = new ServerIO(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error('Invalid token'));
      }

      const socketData: SocketData = {
        gameId: payload.gameId,
        email: payload.email
      };

      if (payload.type === 'session' && payload.playerId) {
        socketData.playerId = payload.playerId;
        socketData.type = 'player';
      } else if (payload.type === 'admin') {
        socketData.type = 'admin';
      } else {
        return next(new Error('Invalid token type'));
      }

      socket.data = socketData;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const data = socket.data as SocketData;

    if (data.gameId) {
      // Join game room
      socket.join(`game:${data.gameId}`);

      // Notify others about player joining (only for players, not admins)
      if (data.type === 'player' && data.playerId) {
        socket.to(`game:${data.gameId}`).emit('player_connected', {
          playerId: data.playerId,
          email: data.email
        });
      }
    }

    socket.on('disconnect', () => {
      if (data.gameId && data.type === 'player' && data.playerId) {
        socket.to(`game:${data.gameId}`).emit('player_disconnected', {
          playerId: data.playerId,
          email: data.email
        });
      }
    });
  });

  setSocketIO(io);
  return io;
}