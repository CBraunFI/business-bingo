import { Server as ServerIO } from 'socket.io';

// Server-side socket emitter utilities
export function emitToGame(io: ServerIO, gameId: string, event: string, data: unknown) {
  io.to(`game:${gameId}`).emit(event, data);
}

export function emitPlayerJoined(io: ServerIO, gameId: string, playerData: unknown) {
  emitToGame(io, gameId, 'player_joined', playerData);
}

export function emitGameStarted(io: ServerIO, gameId: string, gameData: unknown) {
  emitToGame(io, gameId, 'game_started', gameData);
}

export function emitCellUpdated(io: ServerIO, gameId: string, cellData: unknown) {
  emitToGame(io, gameId, 'cell_updated', cellData);
}

export function emitBingo(io: ServerIO, gameId: string, bingoData: unknown) {
  emitToGame(io, gameId, 'bingo', bingoData);
}

export function emitGameFinished(io: ServerIO, gameId: string, finishData: unknown) {
  emitToGame(io, gameId, 'game_finished', finishData);
}