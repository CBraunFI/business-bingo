import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { action, termId, text } = body;

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

    switch (action) {
      case 'toggle': {
        if (!termId) {
          return NextResponse.json(
            { error: 'termId required for toggle action' },
            { status: 400 }
          );
        }

        const term = await prisma.term.findFirst({
          where: { id: termId, gameId }
        });

        if (!term) {
          return NextResponse.json(
            { error: 'Term not found' },
            { status: 404 }
          );
        }

        const updatedTerm = await prisma.term.update({
          where: { id: termId },
          data: { enabled: !term.enabled }
        });

        return NextResponse.json({ term: updatedTerm });
      }

      case 'replace': {
        if (!termId || !text) {
          return NextResponse.json(
            { error: 'termId and text required for replace action' },
            { status: 400 }
          );
        }

        const updatedTerm = await prisma.term.update({
          where: { id: termId, gameId },
          data: {
            text: text.trim(),
            source: 'replaced'
          }
        });

        return NextResponse.json({ term: updatedTerm });
      }

      case 'add': {
        if (!text) {
          return NextResponse.json(
            { error: 'text required for add action' },
            { status: 400 }
          );
        }

        const newTerm = await prisma.term.create({
          data: {
            id: uuidv4(),
            gameId,
            text: text.trim(),
            enabled: true,
            source: 'custom'
          }
        });

        return NextResponse.json({ term: newTerm });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be toggle, replace, or add' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error managing terms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}