"use client";

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Heart, MessageCircle, Send, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function GalleryClient({ eventId, accentColor }: { eventId: string; accentColor: string }) {
  const [userName, setUserName] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll for new media every 3 seconds
  const { data: media, mutate } = useSWR(`/api/media/${eventId}`, fetcher, {
    refreshInterval: 3000,
  });

  useEffect(() => {
    const storedName = localStorage.getItem('gallery_user_name');
    if (storedName) {
      setUserName(storedName);
    } else {
      setShowNameModal(true);
    }
  }, []);

  const saveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('gallery_user_name', tempName.trim());
      setShowNameModal(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userName) {
      setShowNameModal(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
      let fileToUpload = file;
      
      if (file.type.startsWith('image/')) {
        setUploadProgress(30);
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          onProgress: (p) => setUploadProgress(30 + Math.floor(p * 0.4)) // up to 70%
        });
      }

      setUploadProgress(80);
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('eventId', eventId);
      formData.append('uploaderName', userName);

      await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(100);
      mutate(); // Refresh gallery immediately
    } catch (err) {
      console.error(err);
      alert('Error al subir el archivo');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleLike = async (mediaId: string) => {
    if (!userName) {
      setShowNameModal(true);
      return;
    }
    
    // Optimistic UI could be added here
    await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, type: 'LIKE', authorName: userName })
    });
    mutate();
  };

  const handleComment = async (e: React.FormEvent, mediaId: string) => {
    e.preventDefault();
    if (!userName) {
      setShowNameModal(true);
      return;
    }
    if (!commentText.trim()) return;

    await fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, type: 'COMMENT', content: commentText.trim(), authorName: userName })
    });
    
    setCommentText('');
    setActiveCommentId(null);
    mutate();
  };

  return (
    <div className="w-full relative">
      {/* Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full text-neutral-800 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">¿Cómo te llamas?</h3>
              {userName && (
                <button onClick={() => setShowNameModal(false)} className="text-neutral-400 hover:text-neutral-700">
                  <X size={24} />
                </button>
              )}
            </div>
            <p className="text-neutral-600 mb-6">Queremos saber quién sube las mejores fotos.</p>
            <input 
              type="text" 
              placeholder="Tu nombre..."
              className="w-full border-2 border-neutral-200 rounded-xl p-4 text-lg focus:outline-none focus:border-[var(--theme-secondary)] transition-colors mb-6 font-medium"
              style={{ '--tw-ring-color': accentColor } as any}
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              autoFocus
            />
            <button 
              onClick={saveName}
              style={{ backgroundColor: accentColor }}
              className="w-full text-black font-bold text-lg rounded-xl p-4 hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Entrar al Evento
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button for Upload */}
      <div className="fixed bottom-8 right-8 z-[90]">
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ backgroundColor: accentColor }}
          className="w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-transform"
        >
          <Upload size={28} className="stroke-[2.5]" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*" 
          onChange={handleUpload}
        />
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-neutral-800/50">
          <div 
            className="h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
            style={{ width: `${uploadProgress}%`, backgroundColor: accentColor }} 
          />
        </div>
      )}

      {/* Lightbox / Fullscreen Viewer */}
      {lightboxIndex !== null && media && media[lightboxIndex] && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col justify-center items-center backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 text-white/60 hover:text-white p-2 z-50 transition-colors"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={32} />
          </button>

          {/* Navigation */}
          <div className="absolute inset-y-0 w-full flex justify-between items-center px-2 sm:px-6 md:px-12 pointer-events-none z-40">
            <button 
              className="pointer-events-auto bg-black/50 text-white p-3 sm:p-4 rounded-full hover:bg-black/90 transition-all shadow-xl disabled:opacity-0"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev! > 0 ? prev! - 1 : prev); }}
              disabled={lightboxIndex === 0}
            >
              <ChevronLeft size={36} />
            </button>
            <button 
              className="pointer-events-auto bg-black/50 text-white p-3 sm:p-4 rounded-full hover:bg-black/90 transition-all shadow-xl disabled:opacity-0"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev! < media.length - 1 ? prev! + 1 : prev); }}
              disabled={lightboxIndex === media.length - 1}
            >
              <ChevronRight size={36} />
            </button>
          </div>

          {/* Media Content */}
          <div 
            className="w-full h-full max-w-6xl p-4 md:p-8 flex items-center justify-center relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {media[lightboxIndex].mediaType === 'VIDEO' ? (
              <video 
                src={media[lightboxIndex].fileUrl} 
                controls 
                autoPlay 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
              />
            ) : (
              <img 
                src={media[lightboxIndex].fileUrl} 
                alt="Fullscreen view" 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm select-none" 
              />
            )}
            
            <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
               <span className="bg-black/80 backdrop-blur-md px-5 py-2.5 rounded-full text-white/90 text-sm font-medium border border-white/10 shadow-lg inline-block">
                 Subida por {media[lightboxIndex].uploaderName}
               </span>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Empty States */}
      {!media && <div className="text-center w-full py-20 text-neutral-400">Loading moments...</div>}
      {media?.length === 0 && (
        <div className="text-center w-full py-20 px-6 text-lg md:text-xl font-light text-neutral-400 opacity-80">
          Nadie ha subido fotos aún. <br className="md:hidden" />
          <span className="font-semibold text-neutral-300">¡Sé el primero!</span>
        </div>
      )}

      {/* Gallery Grid */}
      {media && media.length > 0 && (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6 space-y-3 md:space-y-6">
          {media.map((item: any, index: number) => {
          const likesCount = item.interactions.filter((i: any) => i.type === 'LIKE').length;
          const comments = item.interactions.filter((i: any) => i.type === 'COMMENT');

          return (
            <div key={item.id} className="break-inside-avoid bg-neutral-900/60 backdrop-blur-md border border-neutral-800/50 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl mb-3 md:mb-6 transform transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
              <div className="w-full relative group">
                {/* Overlay that intercepts clicks to open lightbox */}
                <div 
                  className="absolute inset-0 z-10 cursor-pointer" 
                  onClick={() => setLightboxIndex(index)}
                />
                
                {item.mediaType === 'VIDEO' ? (
                  <video src={item.fileUrl} className="w-full object-cover" />
                ) : (
                  <img src={item.fileUrl} alt="Event moment" className="w-full object-cover transition-opacity duration-300" loading="lazy" />
                )}
                
                {/* Uploader tag overlay */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                   <div style={{ backgroundColor: accentColor }} className="w-2 h-2 rounded-full" />
                   {item.uploaderName}
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-3 md:gap-4 mb-3 md:mb-4">
                  <button onClick={() => handleLike(item.id)} className="flex items-center gap-1.5 md:gap-2 text-neutral-200 hover:text-white transition-colors group">
                    <Heart size={18} className="md:w-5 md:h-5 group-active:scale-75 transition-transform" /> 
                    <span className="font-semibold text-xs md:text-sm">{likesCount}</span>
                  </button>
                  <button onClick={() => setActiveCommentId(activeCommentId === item.id ? null : item.id)} className="flex items-center gap-1.5 md:gap-2 text-neutral-200 hover:text-white transition-colors">
                    <MessageCircle size={18} className="md:w-5 md:h-5" /> 
                    <span className="font-semibold text-xs md:text-sm">{comments.length}</span>
                  </button>
                </div>

                {/* Comments List */}
                {comments.length > 0 && (
                  <div className="space-y-2.5 mb-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="text-sm bg-neutral-800/40 p-2.5 rounded-lg border border-neutral-700/50">
                        <span className="font-bold mr-2 text-neutral-100" style={{ color: accentColor }}>{comment.authorName}</span>
                        <span className="text-neutral-300">{comment.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                {activeCommentId === item.id && (
                  <form onSubmit={(e) => handleComment(e, item.id)} className="relative flex items-center">
                    <input 
                      type="text" 
                      placeholder="Agrega un comentario..."
                      className="w-full bg-neutral-800/80 border border-neutral-700 rounded-full px-4 py-2.5 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-[var(--theme-secondary)] transition-colors pr-12 font-medium"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="absolute right-2 p-1.5 text-neutral-400 hover:text-white transition-colors">
                      <Send size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
