'use client';
// app/royxatdan-otish/page.jsx - Ro'yxatdan o'tish sahifasi

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors(data.errors || {});
        toast.error(data.message || "Ro'yxatdan o'tishda xatolik");
        return;
      }

      login(data.user);
      toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
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
      <h1 className="text-2xl font-bold text-center mb-6">Ro'yxatdan o'tish</h1>

      <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1">Ismingiz</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Ism Familiya" className="input-field" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Telefon raqam</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+998901234567" className="input-field" />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Parol</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Kamida 4 belgi" className="input-field" />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
          {submitting ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
        </button>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Akkountingiz bormi? <Link href="/kirish" className="text-brand-600 dark:text-brand-400 font-semibold">Kiring</Link>
        </p>
      </form>
    </div>
  );
}
