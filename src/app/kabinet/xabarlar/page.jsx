'use client';
// app/kabinet/xabarlar/page.jsx - Foydalanuvchining barcha suhbatlari ro'yxati

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages/conversations')
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  function formatTime(date) {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/kabinet" className="text-brand-600 dark:text-brand-400 font-semibold mb-4 inline-block text-sm">
        ← Kabinetga qaytish
      </Link>
      <h1 className="text-2xl font-bold mb-6">💬 Xabarlar</h1>

      {loading ? (
        <p className="text-gray-400 py-16 text-center">Yuklanmoqda...</p>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
          <p className="text-gray-400">Hali hech qanday suhbatingiz yo'q.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/kabinet/xabarlar/${c.id}`}
              className="card p-4 flex items-center gap-3 hover:border-brand-400/40 transition"
            >
              <div className="w-11 h-11 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0 font-bold text-brand-600 dark:text-brand-400">
                {c.otherUser.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold truncate">{c.otherUser.name}</p>
                  {c.lastMessage && (
                    <span className="text-xs text-gray-400 shrink-0">{formatTime(c.lastMessage.createdAt)}</span>
                  )}
                </div>
                {c.listing && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 truncate">📦 {c.listing.title}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {c.lastMessage?.content || 'Suhbat boshlandi'}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="bg-brand-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
