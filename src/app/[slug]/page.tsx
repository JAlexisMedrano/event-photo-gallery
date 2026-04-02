import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import GalleryClient from './GalleryClient';

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: slug }
  });

  if (!event) {
    notFound();
  }

  const customStyles = {
    '--theme-primary': event.primaryColor,
    '--theme-secondary': event.secondaryColor,
  } as React.CSSProperties;

  return (
    <div style={customStyles} className="min-h-screen bg-[var(--theme-primary)] text-white w-full overflow-x-hidden font-sans flex flex-col">
      {/* Hero Banner Section */}
      <header className="relative w-full h-[25vh] md:h-[35vh] min-h-[220px] flex items-end justify-center rounded-b-[2rem] md:rounded-b-[3rem] overflow-hidden shadow-2xl mb-8 md:mb-12">
        <div className="absolute inset-0 z-0">
          {event.bannerUrl ? (
            <>
              <img 
                src={event.bannerUrl} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xl scale-110 bg-neutral-900"
              />
              <img 
                src={event.bannerUrl} 
                alt="Event Banner" 
                className="relative z-10 w-full h-full object-contain"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-[var(--theme-primary)]" />
          )}
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-primary)] via-[var(--theme-primary)]/60 to-transparent" />
        </div>

        <div className="relative z-10 text-center pb-8 md:pb-10 px-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-xl mb-2">
            {event.name}
          </h1>
          <div className="h-1 w-16 md:h-1.5 md:w-20 mx-auto rounded-full bg-[var(--theme-secondary)] mb-3 shadow-[0_0_15px_var(--theme-secondary)]" />
          <p className="text-white/90 text-sm sm:text-base md:text-lg font-medium tracking-wide drop-shadow-lg">
            Captura y comparte los mejores momentos.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 pb-32">
        <GalleryClient eventId={event.id} accentColor={event.secondaryColor} />
      </main>
    </div>
  );
}
