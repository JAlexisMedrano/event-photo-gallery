import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since'); // ISO date string

    const whereClause: any = {
      eventId: eventId,
      status: 'ACTIVE',
    };

    if (since) {
      whereClause.createdAt = {
        gt: new Date(since)
      };
    }

    const media = await prisma.media.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        interactions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' } // oldest comments first for thread
        }
      }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
