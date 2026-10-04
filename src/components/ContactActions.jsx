'use client';
// components/ContactActions.jsx - E'lon egasi bilan bog'lanish tugmalari.
// Telefon raqami sahifada yashirin turadi va "Raqamni ko'rsatish" bosilganda
// serverdan olinadi (botlardan himoya + egasi uchun "raqamni ochdi" statistikasi).

import { useState } from 'react';
import { Phone, Send, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactActions({ listingId, maskedPhone, telegramUsername }) {
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(false);

  async function reveal() {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/phone`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPhone(data.phone);
    } catch (err) {
      toast.error(err.message || "Raqamni olib bo'lmadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {phone ? (
        <a href={`tel:${phone}`} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <Phone size={18} /> {phone}
        </a>
      ) : (
        <button onClick={reveal} disabled={loading} className="btn-primary flex-1 flex flex-col items-center justify-center !py-2.5">
          <span className="flex items-center gap-2">
            <Eye size={18} /> {loading ? 'Yuklanmoqda...' : "Raqamni ko'rsatish"}
          </span>
          {maskedPhone && <span className="text-xs font-semibold opacity-80">{maskedPhone}</span>}
        </button>
      )}
      {telegramUsername && (
        <a
          href={`https://t.me/${telegramUsername.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1c8ac2] text-white font-bold py-3 px-6 rounded-xl text-base transition"
        >
          <Send size={18} /> Telegram orqali yozish
        </a>
      )}
    </div>
  );
}
