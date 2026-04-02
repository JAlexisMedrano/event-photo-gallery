import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { mediaId, type, content, authorName } = data; // type = 'LIKE' | 'COMMENT'

    if (!mediaId || !type) {
      return NextResponse.json({ error: 'mediaId and type are required' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const interaction = await prisma.interaction.create({
      data: {
        mediaId,
        type,
        content: content || null,
        authorName: authorName || 'Anonymous',
        ipAddress,
        userAgent,
      }
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 });
  }
}
