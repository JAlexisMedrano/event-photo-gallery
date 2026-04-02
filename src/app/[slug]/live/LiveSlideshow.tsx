"use client";

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { MessageCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function LiveSlideshow({ eventId, accentColor, eventName }: { eventId: string; accentColor: string; eventName: string; }) {
  const { data: remoteMedia } = useSWR(`/api/media/${eventId}`, fetcher, {
    refreshInterval: 5000,
  });

  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // We want to merge the polled list into our queue without losing our loop
  useEffect(() => {
    if (!remoteMedia || remoteMedia.length === 0) return;
    
    setQueue(prevQueue => {
      if (prevQueue.length === 0) return remoteMedia;
      
      // Identify new media not in current queue
      const existingIds = new Set(prevQueue.map(m => m.id));
      const newMedia = remoteMedia.filter((m: any) => !existingIds.has(m.id));
      
      if (newMedia.length > 0) {
        // Insert new media right after the current index to show them immediately next
        const nextIndex = (currentIndex + 1) % prevQueue.length;
        const newQueue = [...prevQueue];
        newQueue.splice(nextIndex, 0, ...newMedia);
        return newQueue;
      }
      return prevQueue; // No changes
    });
  }, [remoteMedia]);

  // Slideshow timer
  useEffect(() => {
    if (queue.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % queue.length);
    }, 7000);
    
    return () => clearInterval(interval);
  }, [queue.length]);

  if (queue.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-4xl text-neutral-500 font-light tracking-wider bg-black">
        Esperando las primeras fotos de {eventName}...
      </div>
    );
  }

  const currentMedia = queue[currentIndex];
  // Get the latest comment across all interactions in this media
  const comments = currentMedia.interactions?.filter((i: any) => i.type === 'COMMENT') || [];
  const latestComment = comments[comments.length - 1]; // since they are ordered asc by prisma in API

  return (
    <div className="relative w-full h-full bg-black">
      {/* Slides with Fade */}
      {queue.map((media, index) => {
        const isActive = index === currentIndex;
        return (
          <div 
            key={media.id} 
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ 
              opacity: isActive ? 1 : 0, 
              zIndex: isActive ? 10 : 0 
            }}
          >
            {media.mediaType === 'VIDEO' ? (
              <video 
                src={media.fileUrl} 
                autoPlay 
                muted 
                loop 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={media.fileUrl} 
                alt="Event moment" 
                className="w-full h-full object-contain"
              />
            )}

            {/* Uploader Name Overlay */}
            <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white/90 font-medium text-2xl shadow-xl border border-white/10 flex items-center gap-4">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: accentColor }}></span>
              {media.uploaderName}
            </div>
          </div>
        );
      })}

      {/* Dynamic Comment Overlay */}
      {latestComment && (
        <div className="absolute bottom-12 inset-x-0 mx-auto w-max max-w-[80%] z-50">
          <div className="bg-black/70 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl flex items-center gap-6 transform translate-y-0 opacity-100 transition-all duration-700 animate-slide-up">
            <div className="p-4 rounded-full" style={{ backgroundColor: `${accentColor}33`, color: accentColor }}>
              <MessageCircle size={32} />
            </div>
            <div>
              <p className="text-white/60 text-lg font-bold tracking-wide uppercase mb-1">
                Comentario de {latestComment.authorName}
              </p>
              <p className="text-white text-3xl font-medium drop-shadow-md">
                "{latestComment.content}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
