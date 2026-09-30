'use client';
// components/TelegramConnectCard.jsx - Kabinetdagi "Telegram bildirishnomalari" kartasi

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function TelegramConnectCard() {
  const [state, setState] = useState(null); // { connected, linkUrl }

  const load = () =>
    fetch('/api/profile/telegram', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setState)
      .catch(() => {});

  useEffect(() => {
    load();
    // Foydalanuvchi botdan qaytganda holatni yangilaymiz
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  async function disconnect() {
    if (!window.confirm("Telegram bildirishnomalarini o'chirasizmi?")) return;
    const res = await fetch('/api/profile/telegram', { method: 'DELETE' });
    if (res.ok) {
      toast.success("O'chirildi");
      load();
    }
  }

  if (!state) return null;

  return (
    <div className="card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="text-3xl">{state.connected ? '🔔' : '🔕'}</div>
      <div className="flex-1">
        <p className="font-bold">
          Telegram bildirishnomalari {state.connected ? <span className="text-green-600 dark:text-green-400">— ulangan</span> : ''}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {state.connected
            ? "Kimdir sizga yozganda va e'loningiz muddati tugashidan oldin Telegram'da xabar olasiz."
            : "Xaridor yozganda darhol bilib oling — xabarlar Telegram'ga keladi."}
        </p>
      </div>
      {state.connected ? (
        <button onClick={disconnect} className="text-sm text-gray-400 hover:text-red-500 font-semibold shrink-0">
          O'chirish
        </button>
      ) : (
        <a
          href={state.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-center py-2.5 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1c8cc1] text-white font-bold text-sm"
        >
          🤖 Telegram'ni ulash
        </a>
      )}
    </div>
  );
}
