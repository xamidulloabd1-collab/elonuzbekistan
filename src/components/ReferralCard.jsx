'use client';
// components/ReferralCard.jsx - Kabinetda ko'rsatiladigan referal havolasi
// (do'stni taklif qilib, ikkalasi ham bepul VIP kredit olishi mumkin)

import { useState } from 'react';
import { Copy, Check, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ReferralCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user?.referralCode) return null;

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${siteUrl}/royxatdan-otish?ref=${user.referralCode}`;

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="text-brand-500 dark:text-brand-400" size={20} />
        <h3 className="font-bold">Do'stingizni taklif qiling</h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Havolangiz orqali ro'yxatdan o'tgan har bir do'stingiz uchun — ikkalangiz ham
        1 tadan bepul VIP kredit olasiz! {user.bonusVipCredits > 0 && (
          <span className="font-bold text-brand-600 dark:text-brand-400">
            Hozir sizda {user.bonusVipCredits} ta bor.
          </span>
        )}
      </p>
      <div className="flex gap-2">
        <input
          readOnly value={referralLink}
          className="input-field !py-2 flex-1 text-sm text-gray-500 dark:text-gray-400"
          onClick={(e) => e.target.select()}
        />
        <button onClick={handleCopy} className="btn-secondary !py-2 !px-4 shrink-0 flex items-center gap-1.5">
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          {copied ? 'Nusxalandi' : 'Nusxalash'}
        </button>
      </div>
    </div>
  );
}
