'use client';
// components/DeleteAccountSection.jsx - Hisobni butunlay o'chirish (parol bilan tasdiqlanadi)
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function DeleteAccountSection() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    setError('');
    setDeleting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.password || data.message || 'Xatolik yuz berdi');
        return;
      }
      toast.success("Hisobingiz o'chirildi. Xayr! 👋");
      try {
        await logout?.();
      } catch {}
      window.location.href = '/';
    } catch {
      toast.error('Tarmoq xatoligi');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div id="hisobni-ochirish" className="card p-5 sm:p-6 border-red-200 dark:border-red-500/30 flex flex-col gap-3">
      <h2 className="font-bold text-lg text-red-600 dark:text-red-400">Hisobni o'chirish</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Hisobingiz, barcha e'lonlaringiz, sevimlilar, xabarlar va boshqa ma'lumotlaringiz butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.
      </p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="self-start text-sm font-bold text-red-600 dark:text-red-400 hover:underline">
          Hisobimni o'chirmoqchiman
        </button>
      ) : (
        <form onSubmit={handleDelete} className="flex flex-col gap-3">
          <div>
            <label className="block font-semibold mb-1 text-sm">Parolingiz</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" autoComplete="current-password" />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div>
            <label className="block font-semibold mb-1 text-sm">Tasdiqlash uchun <b>O'CHIRISH</b> deb yozing</label>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={deleting || !password || confirmText.trim().toUpperCase() !== "O'CHIRISH"}
              className="py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-50"
            >
              {deleting ? "O'chirilmoqda..." : "Hisobni butunlay o'chirish"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-white/10 font-semibold">
              Bekor qilish
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
