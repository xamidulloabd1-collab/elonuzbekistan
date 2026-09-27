'use client';
// components/SmsCodeField.jsx - SMS kod kiritish maydoni + "Qayta yuborish" taymeri
// (ro'yxatdan o'tish va parolni tiklash sahifalarida umumiy)

import { useEffect, useState } from 'react';

export default function SmsCodeField({ phone, channel, value, onChange, error, resendIn, onResend, onChangePhone }) {
  const [seconds, setSeconds] = useState(resendIn || 0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setSeconds(resendIn || 0);
  }, [resendIn]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function handleResend() {
    setResending(true);
    try {
      await onResend();
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {channel === 'telegram' ? (
          <>
            <b className="text-gray-800 dark:text-gray-200">{phone}</b> raqamiga bog'langan{' '}
            <b className="text-gray-800 dark:text-gray-200">Telegram</b>'ga 6 xonali kod yuborildi ("Verification Codes"
            nomli chatni tekshiring).{' '}
          </>
        ) : (
          <>
            <b className="text-gray-800 dark:text-gray-200">{phone}</b> raqamiga 6 xonali kod yuborildi.{' '}
          </>
        )}
        <button type="button" onClick={onChangePhone} className="text-brand-600 dark:text-brand-400 font-semibold">
          Raqamni o'zgartirish
        </button>
      </p>

      <label className="block font-semibold mb-1">Tasdiqlash kodi</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        placeholder="______"
        className="input-field text-center text-2xl tracking-[0.5em] font-bold"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      <div className="text-sm mt-2 text-center">
        {seconds > 0 ? (
          <span className="text-gray-400">Qayta yuborish: {seconds} soniya</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-brand-600 dark:text-brand-400 font-semibold"
          >
            {resending ? 'Yuborilmoqda...' : 'Kodni qayta yuborish'}
          </button>
        )}
      </div>
    </div>
  );
}
