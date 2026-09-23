'use client';
// components/ImageGallery.jsx - E'lon tafsilotlari sahifasidagi rasm galereyasi
//
// Eslatma: rasm endi majburiy 16:9 nisbatga "kesib" solinmaydi - o'z tabiiy
// shakli (portret, kvadrat, landshaft - qanday bo'lsa) bilan to'liq ko'rinadi
// (object-contain), atrofidagi bo'sh joy neytral fon bilan to'ldiriladi.

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function ImageGallery({ images = [], title }) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-video bg-gray-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">
        <ImageOff className="text-gray-300 dark:text-gray-600" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gray-100 dark:bg-surface-800 rounded-2xl overflow-hidden flex items-center justify-center max-h-[520px] min-h-[260px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={title}
          className="w-full max-h-[520px] object-contain"
          onError={(e) => { e.target.style.opacity = '0.3'; }}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-gray-100 dark:bg-surface-800 flex items-center justify-center transition ${
                i === active ? 'border-brand-500' : 'border-transparent opacity-70'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${title} ${i + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
