"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    primaryColor: '#171717',
    secondaryColor: '#d4af37'
  });

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let bannerUrl = undefined;

      // 1. Upload Banner if exists
      if (bannerFile) {
        let finalFile: File = bannerFile;
        // Compress to avoid Vercel 4.5MB limit
        if (bannerFile.type.startsWith('image/')) {
           const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
           const compressedBlob = await imageCompression(bannerFile, options);
           finalFile = new File([compressedBlob], bannerFile.name, { type: bannerFile.type });
        }

        const bd = new FormData();
        bd.append('file', finalFile);
        bd.append('isBanner', 'true');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: bd
        });
        if (uploadRes.ok) {
          const { publicUrl } = await uploadRes.json();
          bannerUrl = publicUrl;
        }
      }

      // 2. Create Event
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          bannerUrl,
          themeColors: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor
          }
        })
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        alert('Failed to create event');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-neutral-100 p-8 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: formData.secondaryColor }} />
      
      <h1 className="text-3xl font-extrabold text-neutral-900 mb-8 mt-2">Crear Nuevo Evento</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Event Name</label>
          <input 
            type="text" 
            required
            placeholder="e.g. Boda de Juan y Maria"
            className="w-full border-2 border-neutral-200 rounded-xl p-4 text-lg focus:outline-none focus:border-black transition-colors"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">Foto de Portada (Opcional)</label>
          <div className="relative border-2 border-dashed border-neutral-300 rounded-xl bg-neutral-50 h-48 flex flex-col items-center justify-center overflow-hidden group hover:border-black transition-colors cursor-pointer">
            {bannerPreview ? (
              <>
                <img src={bannerPreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xl scale-110 group-hover:scale-125 transition-transform duration-500" />
                <img src={bannerPreview} alt="Banner Preview" className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              </>
            ) : (
              <div className="text-neutral-400 flex flex-col items-center gap-2 group-hover:text-black transition-colors">
                <ImagePlus size={32} />
                <span className="font-medium">Subir Banner</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={handleBannerChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 bg-neutral-50 p-6 rounded-xl border border-neutral-100">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Color Primario (Fondo)</label>
            <div className="flex gap-4 items-center bg-white p-2 rounded-lg border border-neutral-200 shadow-sm">
              <input 
                type="color" 
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                value={formData.primaryColor}
                onChange={e => setFormData({...formData, primaryColor: e.target.value})}
              />
              <span className="text-neutral-600 font-mono text-sm font-medium">{formData.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Color Secundario (Botones)</label>
            <div className="flex gap-4 items-center bg-white p-2 rounded-lg border border-neutral-200 shadow-sm">
              <input 
                type="color" 
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                value={formData.secondaryColor}
                onChange={e => setFormData({...formData, secondaryColor: e.target.value})}
              />
              <span className="text-neutral-600 font-mono text-sm font-medium">{formData.secondaryColor}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white rounded-xl p-4 text-lg font-bold hover:bg-neutral-800 disabled:opacity-70 transition-colors shadow-lg active:scale-[0.98]"
          >
            {loading ? 'Creando evento...' : 'Comenzar Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
