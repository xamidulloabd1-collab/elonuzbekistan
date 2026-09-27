// lib/otpClient.js - Brauzer tomonidan SMS kod so'rash (umumiy yordamchi)
import toast from 'react-hot-toast';

/** Qaytaradi: { ok, resendIn, channel, botUrl, errors } */
export async function requestOtp(phone, purpose) {
  try {
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, purpose }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message || 'Kod yuborib bo\'lmadi');
      return { ok: false, errors: data.errors || {}, resendIn: data.resendIn };
    }
    // Lokal sinov rejimi (Eskiz sozlanmagan) - kodni ekranda ko'rsatamiz
    if (data.devCode) {
      toast(`DEV rejim - kod: ${data.devCode}`, { duration: 15000, icon: '🧪' });
    } else if (data.channel === 'bot') {
      toast('Kodni Telegram botimizdan oling 👇', { icon: '🤖', duration: 6000 });
    } else if (data.channel === 'telegram') {
      toast.success('Kod Telegram orqali yuborildi');
    } else {
      toast.success('SMS kod yuborildi');
    }
    return { ok: true, resendIn: data.channel === 'bot' ? 0 : data.resendIn || 60, channel: data.channel, botUrl: data.botUrl };
  } catch (err) {
    console.error(err);
    toast.error('Tarmoq xatoligi, internetni tekshiring');
    return { ok: false, errors: {} };
  }
}
