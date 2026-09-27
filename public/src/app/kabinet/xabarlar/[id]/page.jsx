'use client';
// app/kabinet/xabarlar/[id]/page.jsx - Bitta suhbat oynasi (xabar yozish,
// tarixni ko'rish). Real-vaqt uchun oddiy "polling" - har 4 soniyada yangilanadi.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function ConversationThreadPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    try {
      const res = await fetch(`/api/messages/conversations/${id}`);
      const data = await res.json();
      if (!res.ok) {
        if (!silent) toast.error(data.message || "Suhbat topilmadi");
        return;
      }
      setConversation(data.conversation);
      setMessages(data.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 4000); // oddiy "real-vaqt" - har 4s
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    const content = text;
    setText('');
    try {
      const res = await fetch(`/api/messages/conversations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Xatolik yuz berdi');
        setText(content); // xato bo'lsa, matnni qaytaramiz
        return;
      }
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi');
      setText(content);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Yuklanmoqda...</p>;
  if (!conversation) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Link href="/kabinet/xabarlar" className="text-brand-600 dark:text-brand-400 font-semibold mb-3 inline-block text-sm">
        ← Barcha suhbatlar
      </Link>

      <div className="card p-4 mb-4">
        <p className="font-bold">{conversation.otherUser.name}</p>
        {conversation.listing && (
          <Link href={`/elon/${conversation.listing.id}`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
            📦 {conversation.listing.title}
          </Link>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto mb-4 px-1">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center py-8 text-sm">Hali xabar yo'q. Birinchi bo'lib yozing!</p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === user?.id;
            return (
              <div key={m.id} className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                isMine
                  ? 'self-end bg-brand-500 text-white rounded-br-sm'
                  : 'self-start bg-gray-100 dark:bg-surface-800 rounded-bl-sm'
              }`}>
                <p className="whitespace-pre-line break-words">{m.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 sticky bottom-0 bg-white dark:bg-surface-950 pt-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Xabar yozing..."
          className="input-field flex-1"
          maxLength={2000}
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary !px-4 shrink-0">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
