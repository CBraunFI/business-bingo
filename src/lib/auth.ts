import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  gameId: string;
  playerId?: string;
  type: 'session' | 'admin';
  exp?: number;
}

export function generateSessionToken(gameId: string, playerId: string): string {
  const payload: JWTPayload = {
    gameId,
    playerId,
    type: 'session'
  };
  return jwt.sign(payload, JWT_SECRET);
}

export function generateAdminToken(gameId: string): string {
  const payload: JWTPayload = {
    gameId,
    type: 'admin'
  };
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function generateShareableLink(): string {
  return uuidv4();
}