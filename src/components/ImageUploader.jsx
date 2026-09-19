'use client';
// components/ImageUploader.jsx - Foydalanuvchi telefon/kompyuter galereyasidan
// rasm tanlab yuklashi uchun komponent.
//
// Rasmlar to'g'ridan-to'g'ri o'z serverimizga (/api/upload) yuboriladi, u esa
// Netlify Blobs'da saqlaydi. Tashqi hisob (Cloudinary va h.k.) kerak emas -
// Netlify hisobingizning o'zida ishlaydi.

import { useState, useRef } from 'react';
import { X, ImagePlus, Loader2, ImageIcon } from 'lucide-react';

const MAX_IMAGES = 8;
const MAX_FILE_SIZE_MB = 5;

export default function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  async function uploadOneFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Rasmni yuklab bo'lmadi");
    }

    return data.url;
  }

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // xuddi shu faylni qayta tanlash imkoni uchun
    if (files.length === 0) return;

    setError('');

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`Ko'pi bilan ${MAX_IMAGES} ta rasm qo'shish mumkin`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    const oversized = filesToUpload.find((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized) {
      setError(`Har bir rasm ${MAX_FILE_SIZE_MB} MB dan kichik bo'lishi kerak`);
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of filesToUpload) {
        const url = await uploadOneFile(file);
        uploadedUrls.push(url);
      }
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      console.error('Rasm yuklashda xatolik:', err);
      setError(err.message || "Rasm yuklashda xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || images.length >= MAX_IMAGES}
        className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Yuklanmoqda...
          </>
        ) : (
          <>
            <ImagePlus size={18} /> Galereyadan rasm tanlash
          </>
        )}
      </button>
      <p className="text-xs text-gray-400 mt-1 text-center">
        Bir nechta rasmni birdan tanlashingiz mumkin ({images.length}/{MAX_IMAGES})
      </p>

      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

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

      {images.length === 0 && !uploading && (
        <div className="mt-3 flex items-center gap-2 text-gray-400 text-sm justify-center">
          <ImageIcon size={16} /> Hali rasm qo'shilmagan
        </div>
      )}
    </div>
  );
}
