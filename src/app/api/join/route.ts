import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, generateSessionToken, hashToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify invite token
    const payload = verifyToken(token);
    if (!payload || payload.type !== 'invite') {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 401 }
      );
    }

    const { gameId, email } = payload;

    // Find the player
    const player = await prisma.player.findFirst({
      where: {
        gameId,
        email,
        inviteTokenHash: hashToken(token),
        status: 'invited'
      },
      include: {
        game: true
      }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Invalid invitation or player already joined' },
        { status: 404 }
      );
    }

    if (player.game.status === 'finished') {
      return NextResponse.json(
        { error: 'Game has already finished' },
        { status: 400 }
      );
    }

    // Update player status
    const updatedPlayer = await prisma.player.update({
      where: { id: player.id },
      data: {
        status: 'joined',
        joinedAt: new Date()
      }
    });

    // Generate session token
    const sessionToken = generateSessionToken(gameId, player.id);

    // Log join event
    await prisma.eventLog.create({
      data: {
        gameId,
        type: 'player_joined',
        payload: {
          playerId: player.id,
          playerEmail: email
        }
      }
    });

    return NextResponse.json({
      success: true,
      sessionToken,
      player: {
        id: updatedPlayer.id,
        email: updatedPlayer.email,
        status: updatedPlayer.status
      },
      game: {
        id: player.game.id,
        title: player.game.title,
        status: player.game.status
      }
    });

  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}