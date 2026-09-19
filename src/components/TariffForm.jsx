'use client';
// components/TariffForm.jsx - Tarif tanlash va ariza yuborish

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Check, Send } from 'lucide-react';
import { PLAN_LABELS, PLAN_PRICES } from '@/lib/labels';

const TARIFFS = [
  {
    id: null,
    name: "Boshlang'ich",
    price: 'Bepul',
    features: ["Cheklanmagan oddiy e'lonlar", "Asosiy qidiruvda ko'rinish", "Shaxsiy kabinet"],
    free: true,
  },
  {
    id: 'TADBIRKOR',
    name: PLAN_LABELS.TADBIRKOR,
    price: PLAN_PRICES.TADBIRKOR,
    features: ["Boshlang'ich imkoniyatlari", "Oyiga 3 tagacha VIP e'lon", "Ustuvor ko'rinish"],
    highlighted: true,
  },
  {
    id: 'BIZNES',
    name: PLAN_LABELS.BIZNES,
    price: PLAN_PRICES.BIZNES,
    features: ["Barcha e'lonlar avtomatik VIP", "Cheklanmagan e'lonlar", "Makler uchun maxsus status"],
  },
];

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TariffForm({ user }) {
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const sub = user ? { plan: user.subscriptionPlan, status: user.subscriptionStatus, expiresAt: user.subscriptionExpiresAt } : null;
  const isActiveNow =
    sub?.status === 'ACTIVE' && sub?.expiresAt && new Date(sub.expiresAt) > new Date();

  async function handleApply() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscription/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Xatolik yuz berdi");
        return;
      }

      toast.success(data.message);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatoligi, internetni tekshiring");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {user && sub && sub.status !== 'NONE' && (
        <div
          className={`max-w-md mx-auto mb-6 rounded-xl p-4 text-center text-sm font-semibold
          ${sub.status === 'PENDING' ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' : ''}
          ${sub.status === 'ACTIVE' && isActiveNow ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : ''}
          ${sub.status === 'EXPIRED' || (sub.status === 'ACTIVE' && !isActiveNow) ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400' : ''}`}
        >
          {sub.status === 'PENDING' && "⏳ Sizning arizangiz ko'rib chiqilmoqda, iltimos kuting"}
          {sub.status === 'ACTIVE' && isActiveNow && `✅ "${PLAN_LABELS[sub.plan]}" tarifi ${formatDate(sub.expiresAt)}gacha faol`}
          {(sub.status === 'EXPIRED' || (sub.status === 'ACTIVE' && !isActiveNow)) && "⌛ Obunangiz muddati tugagan, yangi tarif tanlang"}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {TARIFFS.map((t) => (
          <div
            key={t.name}
            onClick={() => !t.free && setSelected(t.id)}
            className={`card p-5 ${t.free ? '' : 'cursor-pointer'} ${
              selected === t.id && !t.free ? 'ring-2 ring-brand-500 border-brand-500' : ''
            } ${t.highlighted ? 'shadow-md' : ''}`}
          >
            {t.highlighted && <span className="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1 inline-block">TAVSIYA ETAMIZ</span>}
            <h3 className="text-xl font-extrabold">{t.name}</h3>
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 my-2">{t.price}</p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 flex flex-col gap-1 mb-4">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="text-brand-500 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {!t.free && (
              <button
                type="button"
                className={`w-full py-2 rounded-xl font-bold ${
                  selected === t.id ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-surface-800 text-gray-700 dark:text-gray-200'
                }`}
              >
                {selected === t.id ? 'Tanlandi ✓' : 'Tanlash'}
              </button>
            )}
            {t.free && <p className="text-center text-xs text-gray-400 font-semibold py-2">Har doim bepul</p>}
          </div>
        ))}
      </div>

      {selected && !user && (
        <div className="max-w-md mx-auto card p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Tarifga ariza berish uchun avval tizimga kiring yoki ro'yxatdan o'ting.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/kirish" className="btn-primary">Kirish</Link>
            <Link href="/royxatdan-otish" className="btn-secondary">Ro'yxatdan o'tish</Link>
          </div>
        </div>
      )}

      {selected && user && (
        <div className="max-w-md mx-auto card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold">"{PLAN_LABELS[selected]}" tarifi uchun ariza</h2>
          <div className="bg-gray-50 dark:bg-surface-800 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
            <p><strong>Ism:</strong> {user.name}</p>
            <p><strong>Telefon:</strong> {user.phone}</p>
          </div>
          <button
            onClick={handleApply}
            disabled={submitting || sub?.status === 'PENDING' || isActiveNow}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Send size={16} /> {submitting ? "Yuborilmoqda..." : "Ariza yuborish"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            To'lov onlayn amalga oshirilmaydi — operatorimiz siz bilan bog'lanadi, so'ng arizangiz admin panelda tasdiqlanadi.
          </p>
        </div>
      )}
    </div>
  );
}
