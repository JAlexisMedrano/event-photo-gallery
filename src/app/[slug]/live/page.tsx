import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import LiveSlideshow from './LiveSlideshow';

export default async function LiveTVPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug: slug }
  });

  if (!event) {
    notFound();
  }

  // Inject colors to CSS variables mapping
  const customStyles = {
    '--theme-primary': event.primaryColor,
    '--theme-secondary': event.secondaryColor,
  } as React.CSSProperties;

  return (
    <div style={customStyles} className="w-screen h-screen overflow-hidden bg-black text-white font-sans">
      <LiveSlideshow eventId={event.id} accentColor={event.secondaryColor} eventName={event.name} />
    </div>
  );
}
