import { Server as ServerIO } from 'socket.io';

// Server-side socket emitter utilities
export function emitToGame(io: ServerIO, gameId: string, event: string, data: any) {
  io.to(`game:${gameId}`).emit(event, data);
}

export function emitPlayerJoined(io: ServerIO, gameId: string, playerData: any) {
  emitToGame(io, gameId, 'player_joined', playerData);
}

export function emitGameStarted(io: ServerIO, gameId: string, gameData: any) {
  emitToGame(io, gameId, 'game_started', gameData);
}

export function emitCellUpdated(io: ServerIO, gameId: string, cellData: any) {
  emitToGame(io, gameId, 'cell_updated', cellData);
}

export function emitBingo(io: ServerIO, gameId: string, bingoData: any) {
  emitToGame(io, gameId, 'bingo', bingoData);
}

export function emitGameFinished(io: ServerIO, gameId: string, finishData: any) {
  emitToGame(io, gameId, 'game_finished', finishData);
}