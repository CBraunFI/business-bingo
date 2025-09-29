import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  gameId: string;
  playerId?: string;
  email?: string;
  type: 'session' | 'admin' | 'invite';
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

export function generateInviteToken(gameId: string, email: string): string {
  const payload: JWTPayload = {
    gameId,
    email,
    type: 'invite'
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateShareableLink(): string {
  return uuidv4();
}