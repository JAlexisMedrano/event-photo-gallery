import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Link as LinkIcon, QrCode } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import DeleteButton from './DeleteButton';
import Link from 'next/link';
import { headers } from 'next/headers';
import QRCodeDisplay from './QRCodeDisplay';
import BannerManager from './BannerManager';

export default async function EventModerationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: slug },
    include: {
      media: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
          interactions: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  });

  if (!event) notFound();

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  // Standard simple inference for protocol. If it's a real prod environment like Vercel, it injects x-forwarded-proto
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const eventUrl = `${protocol}://${host}/${event.slug}`;

  return (
    <div className="space-y-8 print:space-y-0">
      {/* Header card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">{event.name}</h1>
          <p className="text-neutral-500 font-mono text-sm">Dashboard de Moderación</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href={`/${event.slug}`} 
            target="_blank"
            className="flex items-center gap-2 bg-neutral-100 text-neutral-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-neutral-200 transition-colors"
          >
            <LinkIcon size={18} /> Galería Pública
          </Link>
          <Link 
            href={`/${event.slug}/live`} 
            target="_blank"
            className="flex items-center gap-2 bg-[var(--theme-secondary)] text-black px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            style={{ '--theme-secondary': event.secondaryColor } as any}
          >
            Ver Live TV
          </Link>
        </div>
      </div>

      {/* QR Section */}
      <QRCodeDisplay url={eventUrl} eventName={event.name} />

      {/* Banner Upload Section */}
      <BannerManager eventId={event.id} currentBannerUrl={event.bannerUrl} />

      {/* Moderation Grid */}
      <div className="print:hidden">
        <h2 className="text-2xl font-bold text-neutral-800 mb-6">Fotografías Subidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {event.media.length === 0 ? (
            <div className="col-span-full py-16 text-center text-neutral-500 bg-white rounded-3xl border border-neutral-100 shadow-sm font-medium">
              Aún no hay fotos ni videos.
            </div>
          ) : (
            event.media.map((item: any) => (
              <div key={item.id} className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-shadow group">
                <div className="relative h-56 bg-neutral-100">
                  {item.mediaType === 'VIDEO' ? (
                    <video src={item.fileUrl} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.fileUrl} alt="Media" className="w-full h-full object-cover" loading="lazy" />
                  )}
                  {/* Delete button: always visible on mobile, hover on desktop */}
                  <div className="absolute top-3 right-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <DeleteButton 
                      message="¿Seguro que deseas eliminar esta fotografía de la galería?"
                      actionFn={async () => {
                        'use server';
                        await prisma.media.update({ where: { id: item.id }, data: { status: 'DELETED' }});
                        revalidatePath(`/admin/events/${slug}`);
                      }} 
                    />
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="font-bold text-neutral-800 bg-neutral-100 px-3 py-1 rounded-full">{item.uploaderName}</span>
                    <span className="text-neutral-400 font-medium">{format(item.createdAt, 'MMM d, HH:mm')}</span>
                  </div>
                  
                  <div className="flex-1 space-y-3 max-h-48 overflow-y-auto w-full scrollbar-thin">
                    {item.interactions.filter((i: any) => i.type === 'COMMENT').map((comment: any) => (
                      <div key={comment.id} className="flex justify-between items-start gap-3 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                        <div className="text-sm">
                          <span className="font-extrabold text-neutral-800 break-words">{comment.authorName}: </span>
                          <span className="text-neutral-600 break-words">{comment.content}</span>
                        </div>
                        <DeleteButton 
                          isComment
                          message="¿Deseas eliminar este comentario para todos?"
                          actionFn={async () => {
                            'use server';
                            await prisma.interaction.update({ where: { id: comment.id }, data: { status: 'DELETED' }});
                            revalidatePath(`/admin/events/${slug}`);
                          }} 
                        />
                      </div>
                    ))}
                    {item.interactions.filter((i: any) => i.type === 'COMMENT').length === 0 && (
                      <div className="text-center text-sm text-neutral-400 font-medium italic mt-4">Sin comentarios</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
