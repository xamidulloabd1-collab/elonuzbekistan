'use client';
// components/ImageUploader.jsx - Foydalanuvchi telefon/kompyuter galereyasidan
// rasm tanlab yuklashi uchun komponent.
//
// Rasmlar Cloudinary'ga (bepul bulutli xizmat) to'g'ridan-to'g'ri brauzerdan
// yuklanadi va qaytgan URL manzil `images` massiviga qo'shiladi - bazaning
// o'zi (Prisma schema) o'zgarmaydi, chunki u allaqachon URL massivini saqlaydi.
//
// Bu Netlify/Vercel kabi serverless muhitda ishlashi uchun shart - bunday
// muhitlarda oddiy server diskiga fayl yozib, uni doimiy saqlab bo'lmaydi.

import { useState, useRef } from 'react';
import { X, ImagePlus, Loader2, ImageIcon, Link as LinkIcon } from 'lucide-react';

const MAX_IMAGES = 8;
const MAX_FILE_SIZE_MB = 8;

export default function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const fileInputRef = useRef(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const isConfigured = Boolean(cloudName && uploadPreset);

  async function uploadOneFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Rasmni yuklab bo'lmadi");
    }

    const data = await res.json();
    return data.secure_url;
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
      setError("Rasm yuklashda xatolik yuz berdi, qayta urinib ko'ring");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    onChange(images.filter((img) => img !== url));
  }

  function addUrlManually() {
    const url = urlDraft.trim();
    if (!url) return;
    if (images.length >= MAX_IMAGES) return;
    if (!images.includes(url)) {
      onChange([...images, url]);
    }
    setUrlDraft('');
  }

  return (
    <div>
      {isConfigured ? (
        <>
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
        </>
      ) : (
        // Agar Cloudinary sozlanmagan bo'lsa (masalan lokal test muhitida),
        // eski usul - URL orqali qo'shish - avtomatik ko'rsatiladi
        <ImageUrlFallback urlDraft={urlDraft} setUrlDraft={setUrlDraft} onAdd={addUrlManually} disabled={images.length >= MAX_IMAGES} />
      )}

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

      {isConfigured && (
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="text-xs text-gray-400 hover:text-brand-500 mt-3 flex items-center gap-1 mx-auto"
        >
          <LinkIcon size={12} /> {showUrlInput ? 'Yashirish' : "Yoki URL orqali qo'shish"}
        </button>
      )}
      {isConfigured && showUrlInput && (
        <div className="mt-2">
          <ImageUrlFallback urlDraft={urlDraft} setUrlDraft={setUrlDraft} onAdd={addUrlManually} disabled={images.length >= MAX_IMAGES} />
        </div>
      )}
    </div>
  );
}

// Kichik yordamchi: qo'lda URL kiritish maydoni (Cloudinary sozlanmaganda
// asosiy usul sifatida, sozlangan bo'lsa ixtiyoriy qo'shimcha sifatida ishlaydi)
function ImageUrlFallback({ urlDraft, setUrlDraft, onAdd, disabled }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  }
  return (
    <div className="flex gap-2">
      <input
        type="url"
        value={urlDraft}
        onChange={(e) => setUrlDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="https://... rasm manzili"
        className="input-field"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="btn-secondary !py-0 !px-4 flex items-center gap-1 disabled:opacity-50"
      >
        <ImagePlus size={18} />
      </button>
    </div>
  );
}
