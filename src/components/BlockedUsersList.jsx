'use client';
// components/BlockedUsersList.jsx - Sozlamalardagi "Bloklangan foydalanuvchilar" ro'yxati
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function BlockedUsersList() {
  const [blocks, setBlocks] = useState(null);

  const load = () => fetch('/api/blocks', { cache: 'no-store' }).then((r) => r.json()).then((d) => setBlocks(d.blocks || [])).catch(() => setBlocks([]));
  useEffect(() => {
    load();
  }, []);

  async function unblock(userId) {
    const res = await fetch(`/api/blocks?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Blokdan chiqarildi');
      load();
    }
  }

  return (
    <div className="card p-5 sm:p-6 flex flex-col gap-3 mb-6">
      <h2 className="font-bold text-lg">🚫 Bloklangan foydalanuvchilar</h2>
      {blocks === null ? (
        <p className="text-sm text-gray-400">Yuklanmoqda...</p>
      ) : blocks.length === 0 ? (
        <p className="text-sm text-gray-400">Siz hech kimni bloklamagansiz. Chatda "Bloklash" tugmasi orqali bloklash mumkin.</p>
      ) : (
        blocks.map((b) => (
          <div key={b.user.id} className="flex items-center justify-between gap-3 py-1">
            <span className="font-medium">{b.user.name}</span>
            <button onClick={() => unblock(b.user.id)} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Blokdan chiqarish
            </button>
          </div>
        ))
      )}
    </div>
  );
}
