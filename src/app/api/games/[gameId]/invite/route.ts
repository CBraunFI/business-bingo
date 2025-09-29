import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, generateInviteToken, hashToken } from '@/lib/auth';
import { sendInviteEmail } from '@/lib/email';

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

    // Get game and players
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          where: {
            status: 'invited'
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

    // Send invitation emails
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    await Promise.all(
      game.players.map(async (player) => {
        const inviteToken = generateInviteToken(game.id, player.email);
        const joinUrl = `${appUrl}/join?token=${inviteToken}`;

        try {
          await sendInviteEmail(player.email, game.title, joinUrl);
        } catch (emailError) {
          console.error(`Failed to send email to ${player.email}:`, emailError);
          // Continue with other emails even if one fails
        }
      })
    );

    return NextResponse.json({
      message: 'Invitations sent',
      invitedCount: game.players.length
    });

  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}