'use client';
// app/royxatdan-otish/page.jsx - Ro'yxatdan o'tish (2 bosqich):
// 1) ism, telefon, parol -> SMS kod yuboriladi
// 2) SMS kodni kiritish -> akkaunt yaratiladi

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import SmsCodeField from '@/components/SmsCodeField';
import { requestOtp } from '@/lib/otpClient';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [step, setStep] = useState('form'); // 'form' | 'code'
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [channel, setChannel] = useState(null);
  const [botUrl, setBotUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref'); // Referal havolasi orqali kelgan bo'lsa

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // 1-bosqich: maydonlarni tekshirib, SMS kod so'raymiz
  async function handleSendCode(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Ismingizni kiriting';
    if (form.phone.replace(/\D/g, '').length < 9) errs.phone = "Telefon raqamni to'liq kiriting";
    if (form.password.length < 6) errs.password = "Parol kamida 6 belgidan iborat bo'lishi kerak";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const r = await requestOtp(form.phone, 'REGISTER');
    setSubmitting(false);
    if (r.ok) {
      setResendIn(r.resendIn);
      setChannel(r.channel);
      setBotUrl(r.botUrl || null);
      setCode('');
      setStep('code');
    } else {
      setErrors(r.errors);
      if (r.resendIn) {
        // Kod yaqinda yuborilgan - to'g'ridan-to'g'ri kod kiritish bosqichiga o'tamiz
        setResendIn(r.resendIn);
        setStep('code');
      }
    }
  }

  // 2-bosqich: kod bilan akkaunt yaratamiz
  async function handleRegister(e) {
    e.preventDefault();
    if (code.length !== 6) {
      setErrors({ code: '6 xonali kodni kiriting' });
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, code, ref }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errs = data.errors || {};
        setErrors(errs);
        toast.error(data.message || "Xatolik yuz berdi");
        // Kod emas, forma maydonida xato bo'lsa - 1-bosqichga qaytaramiz
        if (errs.name || errs.phone || errs.password) setStep('form');
        return;
      }

      login(data.user);
      toast.success(ref ? "Xush kelibsiz! Sizga 1 ta bepul VIP kredit berildi 🎁" : "Ro'yxatdan muvaffaqiyatli o'tdingiz!");
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatoligi, internetni tekshiring");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    const r = await requestOtp(form.phone, 'REGISTER');
    if (r.resendIn) setResendIn(r.resendIn);
    if (r.channel) setChannel(r.channel);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Ro'yxatdan o'tish</h1>

      {ref && step === 'form' && (
        <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-400/20 rounded-xl p-3 mb-4 text-sm text-brand-700 dark:text-brand-400 text-center">
          🎁 Do'stingiz taklifi bilan kelyapsiz — ro'yxatdan o'tsangiz, 1 ta bepul VIP kredit olasiz!
        </div>
      )}

      {step === 'form' ? (
        <form onSubmit={handleSendCode} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="block font-semibold mb-1">Ismingiz</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ism Familiya" className="input-field" maxLength={60} />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block font-semibold mb-1">Telefon raqam</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+998 90 123 45 67" className="input-field" />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            <p className="text-xs text-gray-400 mt-1">Bu raqamga (Telegram yoki SMS orqali) tasdiqlash kodi yuboriladi.</p>
          </div>

          <div>
            <label className="block font-semibold mb-1">Parol</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Kamida 6 belgi" className="input-field" autoComplete="new-password" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
            {submitting ? 'Kod yuborilmoqda...' : 'Davom etish'}
          </button>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Akkountingiz bormi? <Link href="/kirish" className="text-brand-600 dark:text-brand-400 font-semibold">Kiring</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="card p-6 flex flex-col gap-4">
          <SmsCodeField
            phone={form.phone}
            channel={channel}
            botUrl={botUrl}
            value={code}
            onChange={setCode}
            error={errors.code}
            resendIn={resendIn}
            onResend={handleResend}
            onChangePhone={() => { setStep('form'); setErrors({}); }}
          />
          <button type="submit" disabled={submitting || code.length !== 6} className="btn-primary w-full">
            {submitting ? 'Tekshirilmoqda...' : "Tasdiqlash va ro'yxatdan o'tish"}
          </button>
        </form>
      )}
    </div>
  );
}
