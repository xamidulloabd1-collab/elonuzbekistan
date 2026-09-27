'use client';
// components/MessageButton.jsx - E'lon sahifasidagi "Xabar yozish" tugmasi -
// suhbatni boshlaydi (yoki mavjudini topadi) va suhbat sahifasiga o'tkazadi

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function MessageButton({ receiverId, listingId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // O'z e'loniga o'zi xabar yoza olmaydi
  if (user?.id === receiverId) return null;

  async function handleClick() {
    if (!user) {
      toast("Xabar yozish uchun tizimga kiring");
      router.push('/kirish');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/messages/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, listingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Xatolik yuz berdi');
        return;
      }
      router.push(`/kabinet/xabarlar/${data.conversationId}`);
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className="btn-secondary w-full flex items-center justify-center gap-2 mt-2">
      <MessageCircle size={18} /> {loading ? 'Yuklanmoqda...' : 'Xabar yozish'}
    </button>
  );
}
