'use client';
// app/parolni-tiklash/page.jsx - SMS kod orqali parolni tiklash (2 bosqich):
// 1) telefon raqam -> SMS kod
// 2) kod + yangi parol -> parol yangilanadi va foydalanuvchi tizimga kiradi

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import SmsCodeField from '@/components/SmsCodeField';
import { requestOtp } from '@/lib/otpClient';

export default function ResetPasswordPage() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'code'
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [channel, setChannel] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSendCode(e) {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 9) {
      setErrors({ phone: "Telefon raqamni to'liq kiriting" });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const r = await requestOtp(phone, 'RESET_PASSWORD');
    setSubmitting(false);
    if (r.ok || r.resendIn) {
      setResendIn(r.resendIn || 0);
      if (r.channel) setChannel(r.channel);
      setCode('');
      setStep('code');
    } else {
      setErrors(r.errors);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    const errs = {};
    if (code.length !== 6) errs.code = '6 xonali kodni kiriting';
    if (newPassword.length < 6) errs.newPassword = "Parol kamida 6 belgidan iborat bo'lishi kerak";
    if (newPassword !== confirm) errs.confirm = 'Parollar mos kelmadi';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || 'Xatolik yuz berdi');
        if (data.errors?.phone) setStep('phone');
        return;
      }
      login(data.user);
      toast.success('Parol yangilandi, xush kelibsiz!');
      router.push('/kabinet');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi, internetni tekshiring');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    const r = await requestOtp(phone, 'RESET_PASSWORD');
    if (r.resendIn) setResendIn(r.resendIn);
    if (r.channel) setChannel(r.channel);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Parolni tiklash</h1>

      {step === 'phone' ? (
        <form onSubmit={handleSendCode} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Telefon raqam</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="input-field" />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            <p className="text-xs text-gray-400 mt-1">Ro'yxatdan o'tgan raqamingizga (Telegram yoki SMS orqali) kod yuboramiz.</p>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Yuborilmoqda...' : 'Kod yuborish'}
          </button>
          <p className="text-center text-sm">
            <Link href="/kirish" className="text-brand-600 dark:text-brand-400 font-semibold">← Kirish sahifasiga qaytish</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleReset} className="card p-6 flex flex-col gap-4">
          <SmsCodeField
            phone={phone}
            channel={channel}
            value={code}
            onChange={setCode}
            error={errors.code}
            resendIn={resendIn}
            onResend={handleResend}
            onChangePhone={() => { setStep('phone'); setErrors({}); }}
          />
          <div>
            <label className="block font-semibold mb-1">Yangi parol</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" autoComplete="new-password" placeholder="Kamida 6 belgi" />
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Yangi parolni takrorlang</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field" autoComplete="new-password" />
            {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Saqlanmoqda...' : 'Parolni yangilash'}
          </button>
        </form>
      )}
    </div>
  );
}
