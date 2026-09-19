'use client';
// components/ImageUrlInput.jsx - Bir nechta rasm URL manzilini qo'shish/o'chirish
// PRD talabiga ko'ra rasm fayl emas, balki URL manzillari sifatida saqlanadi.

import { useState } from 'react';
import { X, Plus, ImageIcon } from 'lucide-react';

const MAX_IMAGES = 8;

export default function ImageUrlInput({ images, onChange }) {
  const [draft, setDraft] = useState('');

  function addImage() {
    const url = draft.trim();
    if (!url) return;
    if (images.length >= MAX_IMAGES) return;
    if (images.includes(url)) {
      setDraft('');
      return;
    }
    onChange([...images, url]);
    setDraft('');
  }

  function removeImage(url) {
    onChange(images.filter((img) => img !== url));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImage();
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://... rasm manzili"
          className="input-field"
          disabled={images.length >= MAX_IMAGES}
        />
        <button
          type="button"
          onClick={addImage}
          disabled={images.length >= MAX_IMAGES}
          className="btn-secondary !py-0 !px-4 flex items-center gap-1 disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Har bir rasm uchun URL manzilini kiriting va Enter bosing ({images.length}/{MAX_IMAGES})
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
          {images.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-surface-800 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Rasm"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                aria-label="Rasmni o'chirish"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm">
          <ImageIcon size={16} /> Hali rasm qo'shilmagan
        </div>
      )}
    </div>
  );
}
