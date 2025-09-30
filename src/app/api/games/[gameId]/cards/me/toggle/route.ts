import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { toggleCell } from '@/lib/game';
import { getSocketIO } from '@/lib/getSocketIO';
import { emitCellUpdated, emitBingo, emitGameFinished } from '@/lib/socketEmitter';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { cellId } = body;

    if (!cellId) {
      return NextResponse.json(
        { error: 'cellId is required' },
        { status: 400 }
      );
    }

    // Verify session token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.type !== 'session' || payload.gameId !== gameId || !payload.playerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if game is running
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'running') {
      return NextResponse.json(
        { error: 'Game is not running' },
        { status: 400 }
      );
    }

    // Toggle the cell
    const result = await toggleCell(cellId, payload.playerId);

    // Get player info for emissions
    const player = await prisma.player.findUnique({
      where: { id: payload.playerId }
    });

    if (result.isBingo) {
      // Mark player as winner and finish game
      await prisma.$transaction(async (tx) => {
        await tx.player.update({
          where: { id: payload.playerId },
          data: { isWinner: true }
        });

        await tx.game.update({
          where: { id: gameId },
          data: {
            status: 'finished',
            endedAt: new Date()
          }
        });

        await tx.eventLog.create({
          data: {
            gameId,
            type: 'bingo',
            payload: {
              playerId: payload.playerId,
              playerName: player?.name,
              cardId: result.cardId
            }
          }
        });
      });

      // Emit bingo and game finished events
      const io = getSocketIO();
      if (io) {
        emitBingo(io, gameId, {
          playerId: payload.playerId,
          playerName: player?.name,
          playerIcon: player?.icon,
          playerColor: player?.color
        });
        emitGameFinished(io, gameId, {
          winnerId: payload.playerId,
          winnerName: player?.name,
          endedAt: new Date()
        });
      }
    }

    // Log the cell toggle
    await prisma.eventLog.create({
      data: {
        gameId,
        type: 'cell_updated',
        payload: {
          cellId,
          playerId: payload.playerId,
          playerName: player?.name,
          isBingo: result.isBingo
        }
      }
    });

    // Emit cell update event
    const io = getSocketIO();
    if (io) {
      emitCellUpdated(io, gameId, {
        cellId,
        playerId: payload.playerId,
        marked: result.marked
      });
    }

    return NextResponse.json({
      success: true,
      isBingo: result.isBingo,
      message: result.isBingo ? 'Bingo! You won!' : 'Cell toggled successfully'
    });

  } catch (error) {
    console.error('Error toggling cell:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}