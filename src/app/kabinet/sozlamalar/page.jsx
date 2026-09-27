'use client';
// app/kabinet/sozlamalar/page.jsx - Profil sozlamalari: ism, Telegram username, parol

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, loading, refreshUser } = useAuth();

  const [profile, setProfile] = useState({ name: '', telegramUsername: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', telegramUsername: user.telegramUsername || '' });
    }
  }, [user]);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileErrors(data.errors || {});
        toast.error(data.message || 'Xatolik yuz berdi');
        return;
      }
      await refreshUser();
      toast.success('Profil yangilandi');
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwdErrors({});
    if (pwd.newPassword !== pwd.confirm) {
      setPwdErrors({ confirm: 'Parollar mos kelmadi' });
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdErrors(data.errors || {});
        toast.error(data.message || 'Xatolik yuz berdi');
        return;
      }
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success("Parol o'zgartirildi");
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi');
    } finally {
      setSavingPwd(false);
    }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Yuklanmoqda...</p>;
  if (!user) {
    return (
      <p className="text-center py-16 text-gray-400">
        Sozlamalarni ko'rish uchun <Link href="/kirish" className="text-brand-600 font-semibold">tizimga kiring</Link>.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/kabinet" className="text-brand-600 dark:text-brand-400 font-semibold mb-4 inline-block text-sm">
        ← Kabinetga qaytish
      </Link>
      <h1 className="text-2xl font-bold mb-6">⚙️ Profil sozlamalari</h1>

      <form onSubmit={handleProfileSubmit} className="card p-5 sm:p-6 flex flex-col gap-4 mb-6">
        <h2 className="font-bold text-lg">Shaxsiy ma'lumotlar</h2>

        <div>
          <label className="block font-semibold mb-1">Ismingiz</label>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input-field"
            maxLength={60}
          />
          {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Telefon raqam</label>
          <input value={user.phone} disabled className="input-field opacity-60 cursor-not-allowed" />
          <p className="text-xs text-gray-400 mt-1">Telefon raqam kirish uchun ishlatiladi, uni o'zgartirib bo'lmaydi.</p>
        </div>

        <div>
          <label className="block font-semibold mb-1">Telegram username (ixtiyoriy)</label>
          <input
            value={profile.telegramUsername}
            onChange={(e) => setProfile({ ...profile, telegramUsername: e.target.value })}
            placeholder="@username"
            className="input-field"
            maxLength={33}
          />
          {profileErrors.telegramUsername && (
            <p className="text-red-500 text-sm mt-1">{profileErrors.telegramUsername}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">E'lonlaringizda "Telegram orqali yozish" tugmasi shu username bilan chiqadi.</p>
        </div>

        <button type="submit" disabled={savingProfile} className="btn-primary self-start">
          {savingProfile ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card p-5 sm:p-6 flex flex-col gap-4">
        <h2 className="font-bold text-lg">Parolni o'zgartirish</h2>

        <div>
          <label className="block font-semibold mb-1">Joriy parol</label>
          <input
            type="password"
            value={pwd.currentPassword}
            onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
            className="input-field"
            autoComplete="current-password"
          />
          {pwdErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{pwdErrors.currentPassword}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Yangi parol</label>
          <input
            type="password"
            value={pwd.newPassword}
            onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
            className="input-field"
            autoComplete="new-password"
          />
          {pwdErrors.newPassword && <p className="text-red-500 text-sm mt-1">{pwdErrors.newPassword}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1">Yangi parolni takrorlang</label>
          <input
            type="password"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            className="input-field"
            autoComplete="new-password"
          />
          {pwdErrors.confirm && <p className="text-red-500 text-sm mt-1">{pwdErrors.confirm}</p>}
        </div>

        <button type="submit" disabled={savingPwd} className="btn-primary self-start">
          {savingPwd ? 'Saqlanmoqda...' : "Parolni o'zgartirish"}
        </button>
      </form>
    </div>
  );
}
