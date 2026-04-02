import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, themeColors, bannerUrl } = data;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 1000);

    const event = await prisma.event.create({
      data: {
        name,
        slug,
        bannerUrl,
        primaryColor: themeColors?.primaryColor || '#171717',
        secondaryColor: themeColors?.secondaryColor || '#d4af37',
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  try {
    if (slug) {
      const event = await prisma.event.findUnique({
        where: { slug }
      });
      if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(event);
    }

    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
