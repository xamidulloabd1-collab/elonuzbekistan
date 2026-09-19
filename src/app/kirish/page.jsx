'use client';
// app/kirish/page.jsx - Tizimga kirish sahifasi

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || "Tizimga kirishda xatolik");
        return;
      }

      login(data.user);
      toast.success("Xush kelibsiz!");
      router.push('/');
      router.refresh(); // joriy va keshlangan sahifalar yangi foydalanuvchi bilan qayta yuklansin
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatoligi, internetni tekshiring");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-6">Tizimga kirish</h1>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1">Telefon raqam</label>
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567" className="input-field"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Parol</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolingiz" className="input-field"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
          {submitting ? "Kirilmoqda..." : "Kirish"}
        </button>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Akkountingiz yo'qmi? <Link href="/royxatdan-otish" className="text-brand-600 dark:text-brand-400 font-semibold">Ro'yxatdan o'ting</Link>
        </p>
      </form>
    </div>
  );
}
