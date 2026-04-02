'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DeleteButton({ 
  actionFn, 
  message, 
  isComment = false 
}: { 
  actionFn: () => Promise<void>, 
  message: string, 
  isComment?: boolean 
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm(message)) {
      setLoading(true);
      try {
        await actionFn();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      type="button" 
      className={isComment 
        ? "text-neutral-400 hover:bg-red-100 hover:text-red-500 p-1.5 rounded-md transition-colors flex-shrink-0 disabled:opacity-50" 
        : "bg-red-500/90 backdrop-blur-md text-white p-2.5 rounded-full hover:scale-110 hover:bg-red-600 active:scale-95 transition-all shadow-[0_4px_20px_rgba(239,68,68,0.5)] border border-red-400/30 disabled:opacity-50 disabled:scale-100"
      }
      title={isComment ? "Eliminar comentario" : "Eliminar Foto"}
    >
      <Trash2 size={isComment ? 14 : 18} className={loading ? "animate-pulse" : ""} />
    </button>
  );
}
