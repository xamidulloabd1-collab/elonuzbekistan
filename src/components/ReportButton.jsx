'use client';
// components/ReportButton.jsx - "⚠️ Shikoyat qilish" tugmasi va sabab tanlash oynasi
// (e'lon sahifasida va chatda ishlatiladi)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Flag, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { REPORT_REASON_LABELS } from '@/lib/labels';

export default function ReportButton({ listingId, reportedUserId, label = 'Shikoyat qilish', className = '' }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [sending, setSending] = useState(false);

  // O'z e'loni yoki o'zi ustidan shikoyat tugmasi ko'rsatilmaydi
  if (user && reportedUserId && user.id === reportedUserId) return null;

  function handleOpen() {
    if (!user) {
      toast('Shikoyat qilish uchun tizimga kiring');
      router.push('/kirish');
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason) {
      toast.error('Sababni tanlang');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, reportedUserId, reason, details }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Xatolik yuz berdi');
        return;
      }
      toast.success(data.message);
      setOpen(false);
      setReason('');
      setDetails('');
    } catch {
      toast.error('Tarmoq xatoligi');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition ${className}`}
      >
        <Flag size={14} /> {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-surface-900 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">⚠️ Shikoyat qilish</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Yopish" className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sababni tanlang. Shikoyatingizni admin 24 soat ichida ko'rib chiqadi.</p>

            <div className="flex flex-col gap-2">
              {Object.entries(REPORT_REASON_LABELS).map(([key, text]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    reason === key ? 'border-red-400 bg-red-50 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10'
                  }`}
                >
                  <input type="radio" name="reason" value={key} checked={reason === key} onChange={() => setReason(key)} className="accent-red-500" />
                  <span className="text-sm font-medium">{text}</span>
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Qo'shimcha izoh (ixtiyoriy)"
              maxLength={1000}
              rows={3}
              className="input-field"
            />

            <button type="submit" disabled={sending} className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-60">
              {sending ? 'Yuborilmoqda...' : 'Shikoyat yuborish'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
