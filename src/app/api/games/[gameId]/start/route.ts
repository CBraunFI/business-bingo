import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateBingoCard } from '@/lib/game';
import { getSocketIO } from '@/lib/getSocketIO';
import { emitGameStarted } from '@/lib/socketEmitter';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Verify admin token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.type !== 'admin' || payload.gameId !== gameId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get game with players
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
        terms: {
          where: {
            enabled: true
          }
        }
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status !== 'draft') {
      return NextResponse.json(
        { error: 'Game is not in draft status' },
        { status: 400 }
      );
    }

    if (game.players.length < 1) {
      return NextResponse.json(
        { error: 'At least 1 player must be joined to start the game' },
        { status: 400 }
      );
    }

    if (game.terms.length < 25) {
      return NextResponse.json(
        { error: 'At least 25 enabled terms are required to start the game' },
        { status: 400 }
      );
    }

    // Start the game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'running',
        startedAt: new Date()
      }
    });

    // Generate bingo cards for all joined players
    try {
      await Promise.all(
        game.players.map(player => generateBingoCard(gameId, player.id))
      );
    } catch (cardError) {
      console.error('Card generation failed:', cardError);
      throw cardError;
    }

    // Log the start event
    await prisma.eventLog.create({
      data: {
        gameId,
        type: 'game_started',
        payload: {
          playerCount: game.players.length,
          startedBy: 'admin'
        }
      }
    });

    // Emit WebSocket event
    const io = getSocketIO();
    if (io) {
      emitGameStarted(io, gameId, {
        status: 'running',
        startedAt: updatedGame.startedAt,
        playerCount: game.players.length
      });
    }

    return NextResponse.json({
      game: updatedGame,
      message: 'Game started successfully'
    });

  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}