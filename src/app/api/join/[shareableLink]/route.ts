import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSessionToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const PLAYER_ICONS = ['🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎷', '🎻', '🎲', '🎰', '🚀', '⭐', '🌟', '💫', '⚡', '🔥', '💎', '🎊', '🎉', '🏆'];
const PLAYER_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareableLink: string }> }
) {
  try {
    const { shareableLink } = await params;
    const body = await request.json();
    const { playerName } = body;

    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    // Find game by shareable link
    const game = await prisma.game.findUnique({
      where: { shareableLink },
      include: {
        players: true
      }
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (game.status === 'finished') {
      return NextResponse.json(
        { error: 'Game has already finished' },
        { status: 400 }
      );
    }

    // Check if player already exists with this name
    const existingPlayer = game.players.find(
      p => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (existingPlayer) {
      // If player exists, return their existing information (allow game creator to "join" their own game)
      const jwt = generateSessionToken(game.id, existingPlayer.id);

      return NextResponse.json({
        success: true,
        sessionToken: jwt,
        player: {
          id: existingPlayer.id,
          name: existingPlayer.name,
          icon: existingPlayer.icon,
          color: existingPlayer.color
        },
        game: {
          id: game.id,
          title: game.title,
          status: game.status
        }
      });
    }

    // Get next available icon and color
    const usedIcons = game.players.map(p => p.icon);
    const usedColors = game.players.map(p => p.color);

    const availableIcons = PLAYER_ICONS.filter(icon => !usedIcons.includes(icon));
    const availableColors = PLAYER_COLORS.filter(color => !usedColors.includes(color));

    const playerIcon = availableIcons[0] || '👤';
    const playerColor = availableColors[0] || '#6B7280';

    // Generate session token
    const sessionToken = uuidv4();

    // Create player
    const player = await prisma.player.create({
      data: {
        gameId: game.id,
        name: playerName.trim(),
        icon: playerIcon,
        color: playerColor,
        sessionToken
      }
    });

    // Generate JWT for this session
    const jwt = generateSessionToken(game.id, player.id);

    return NextResponse.json({
      success: true,
      sessionToken: jwt,
      player: {
        id: player.id,
        name: player.name,
        icon: player.icon,
        color: player.color
      },
      game: {
        id: game.id,
        title: game.title,
        status: game.status
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