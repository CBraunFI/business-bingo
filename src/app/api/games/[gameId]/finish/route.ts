import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    // Get game
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status === 'finished') {
      return NextResponse.json(
        { error: 'Game is already finished' },
        { status: 400 }
      );
    }

    // Finish the game
    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'finished',
        endedAt: new Date()
      }
    });

    // Log the finish event
    await prisma.eventLog.create({
      data: {
        gameId,
        type: 'game_finished',
        payload: {
          finishedBy: payload.email,
          manual: true
        }
      }
    });

    return NextResponse.json({
      game: updatedGame,
      message: 'Game finished successfully'
    });

  } catch (error) {
    console.error('Error finishing game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}