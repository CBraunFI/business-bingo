import { NextApiRequest } from 'next';
import { NextApiResponseServerIO, initializeSocket } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Setting up socket.io server...');
    const io = initializeSocket(res.socket.server);
    res.socket.server.io = io;
  }

  res.end();
}