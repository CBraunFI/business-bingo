import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createDefaultTerms } from '@/lib/game';
import { generateAdminToken, generateShareableLink, generateSessionToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const PLAYER_ICONS = ['🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎷', '🎻', '🎲', '🎰', '🚀', '⭐', '🌟', '💫', '⚡', '🔥', '💎', '🎊', '🎉', '🏆'];
const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, playerName } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Game title is required' },
        { status: 400 }
      );
    }

    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Generate shareable link first
    const shareableLink = generateShareableLink();

    // Create game
    const game = await prisma.game.create({
      data: {
        title: title.trim(),
        status: 'draft',
        adminToken: 'temp', // Will be updated after game creation
        shareableLink: shareableLink // Store only the UUID
      }
    });

    // Generate admin token with gameId and update game
    const adminToken = generateAdminToken(game.id);
    await prisma.game.update({
      where: { id: game.id },
      data: { adminToken }
    });

    // Create default terms
    await createDefaultTerms(game.id);

    // Create the first player (game creator)
    const playerIcon = PLAYER_ICONS[0]; // First icon
    const playerColor = PLAYER_COLORS[0]; // First color

    const player = await prisma.player.create({
      data: {
        gameId: game.id,
        name: playerName.trim(),
        icon: playerIcon,
        color: playerColor,
        sessionToken: uuidv4()
      }
    });

    // Generate session token for the player
    const sessionToken = generateSessionToken(game.id, player.id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3007';
    const joinUrl = `${appUrl}/join/${shareableLink}`;
    const adminUrl = `${appUrl}/admin/${game.id}?token=${adminToken}`;

    return NextResponse.json({
      game: {
        id: game.id,
        title: game.title,
        status: game.status,
        shareableLink: joinUrl,
        adminUrl
      },
      player: {
        id: player.id,
        name: player.name,
        icon: player.icon,
        color: player.color
      },
      adminToken,
      sessionToken
    });

  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}