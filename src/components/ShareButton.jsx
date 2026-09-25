'use client';
// components/ShareButton.jsx - E'lonni Telegram/WhatsApp'ga ulashish yoki
// havolani nusxalash. Telefonlarda (qo'llab-quvvatlasa) tizimning o'z
// "Ulashish" oynasini ochadi (Instagram'ga ulashish shu orqali ham mumkin).

import { useState } from 'react';
import { Share2, Send, MessageCircle, Link as LinkIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareButton({ url, title }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Foydalanuvchi ulashishni bekor qilgan bo'lishi mumkin - xato ko'rsatmaymiz
      }
    } else {
      setOpen((v) => !v);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Havola nusxalandi');
    setTimeout(() => setCopied(false), 2000);
  }

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

  return (
    <div className="relative">
      <button onClick={handleNativeShare} className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2">
        <Share2 size={16} /> Ulashish
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 right-0 card p-2 flex flex-col gap-1 min-w-[180px]">
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-sm">
              <Send size={16} className="text-sky-500" /> Telegram
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-sm">
              <MessageCircle size={16} className="text-green-500" /> WhatsApp
            </a>
            <button onClick={copyLink} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-sm text-left">
              {copied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} className="text-gray-400" />}
              Havolani nusxalash
            </button>
          </div>
        </>
      )}
    </div>
  );
}
