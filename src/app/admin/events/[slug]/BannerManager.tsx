"use client";

import { useState, useRef } from 'react';
import { ImagePlus, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BannerManager({ eventId, currentBannerUrl }: { eventId: string, currentBannerUrl: string | null }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload the image file
      const bd = new FormData();
      bd.append('file', file);
      bd.append('isBanner', 'true');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: bd
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      
      const { publicUrl } = await uploadRes.json();

      // 2. Patch the event with the new bannerUrl
      const patchRes = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl: publicUrl })
      });

      if (!patchRes.ok) throw new Error('Failed to update event banner');

      router.refresh();
      
    } catch (err) {
      console.error(err);
      alert('Error updating banner image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 print:hidden mt-8 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-neutral-800">Foto de Portada del Evento</h2>
      </div>
      <p className="text-neutral-500 text-sm mb-6 max-w-2xl">
        Esta imagen será lo primero que vean tus invitados al entrar a la galería o al escanear el QR.
      </p>

      <div className="w-full relative rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 h-48 md:h-64 flex items-center justify-center group">
        <input 
          type="file" 
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
          disabled={isUploading}
        />
        
        {currentBannerUrl ? (
          <>
            <img src={currentBannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xl scale-110" />
            <img src={currentBannerUrl} alt="Banner" className="relative z-10 w-full h-full object-contain" />
            <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black font-semibold px-6 py-3 rounded-full flex gap-2 items-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <Upload size={18} /> Cambiar Foto
              </button>
            </div>
          </>
        ) : (
          <div className="text-neutral-400 flex flex-col items-center gap-3">
            <ImagePlus size={48} className="opacity-50" />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-black text-white font-semibold px-6 py-3 rounded-full flex gap-2 items-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                <Upload size={18} /> Agregar Portada
            </button>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center text-black font-bold text-lg">
            <Loader2 className="animate-spin mb-2" size={32} />
            Subiendo...
          </div>
        )}
      </div>
    </div>
  );
}
