import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

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

    // Get player's card
    console.log(`Looking for card - gameId: ${gameId}, playerId: ${payload.playerId}`);

    // First, let's see what cards exist for this game
    const allCards = await prisma.card.findMany({
      where: { gameId },
      select: { id: true, playerId: true }
    });
    console.log('All cards in game:', allCards);

    const card = await prisma.card.findFirst({
      where: {
        gameId,
        playerId: payload.playerId
      },
      include: {
        cells: {
          include: {
            term: true
          },
          orderBy: [
            { row: 'asc' },
            { col: 'asc' }
          ]
        }
      }
    });

    if (!card) {
      console.log(`Card not found for player ${payload.playerId} in game ${gameId}`);
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    console.log(`Found card ${card.id} for player ${payload.playerId}`);

    return NextResponse.json({ card });

  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}