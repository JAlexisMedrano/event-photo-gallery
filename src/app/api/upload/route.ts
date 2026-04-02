import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const eventId = data.get('eventId') as string;
    const uploaderName = data.get('uploaderName') as string;
    const isBanner = data.get('isBanner') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'File is required.' }, { status: 400 });
    }
    if (!isBanner && !eventId) {
      return NextResponse.json({ error: 'eventId is required.' }, { status: 400 });
    }

    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const blob = await put(filename, file, { access: 'public' });
    const publicUrl = blob.url;

    if (isBanner) {
      return NextResponse.json({ publicUrl });
    }

    const media = await prisma.media.create({
      data: {
        eventId,
        fileUrl: publicUrl,
        uploaderName: uploaderName || 'Anonymous',
        mediaType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
      },
      include: { interactions: true }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Something went wrong during upload.' }, { status: 500 });
  }
}
