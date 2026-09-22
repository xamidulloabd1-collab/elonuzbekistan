'use client';
// components/Navbar.jsx - Yuqori navigatsiya paneli
// Eslatma: logotip belgisi (icon) o'zi istalgan fonda ishlaydi (shaffof PNG),
// shuning uchun bevosita navbar fonini o'zgartirmasdan ham yangi logotipni
// qo'llash mumkin. "E'lonUz" nomi endi kod orqali, navbar foniga mos rangda
// chiqariladi.

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, LayoutDashboard, LogOut, Tag, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    toast.success('Tizimdan chiqdingiz');
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-surface-950/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
          <Image src="/logo-mark.png" alt="" width={40} height={40} priority className="h-9 w-9" />
          <span className="text-lg font-extrabold text-white">
            E'lon<span className="text-brand-400">Uz</span>
          </span>
        </Link>

        {/* Desktop navigatsiya */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/tariflar" className="text-sm font-semibold text-gray-300 hover:text-brand-400 flex items-center gap-1.5 mr-2 transition">
            <Tag size={16} /> Tariflar
          </Link>
          <ThemeToggle dark />

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-semibold text-gray-300 hover:text-brand-400 border border-white/10 hover:border-brand-400/50 rounded-xl py-2 px-3 flex items-center gap-1.5 transition">
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
              <Link href="/kabinet" className="text-sm font-semibold text-gray-300 hover:text-brand-400 border border-white/10 hover:border-brand-400/50 rounded-xl py-2 px-3 flex items-center gap-1.5 transition">
                <LayoutDashboard size={16} /> Kabinet
              </Link>
              <Link href="/elon-qoshish" className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1.5">
                <Plus size={16} /> E'lon qo'shish
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 p-2 transition"
                aria-label="Chiqish"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link href="/kirish" className="text-sm font-semibold text-gray-300 hover:text-brand-400 py-2 px-3 transition">Kirish</Link>
              <Link href="/royxatdan-otish" className="btn-primary !py-2 !px-4 !text-sm">
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </div>

        {/* Mobil: tema tugmasi + gamburger menyu */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle dark />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-gray-300 p-2"
            aria-label="Menyu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobil ochiladigan menyu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 px-4 py-3 flex flex-col gap-1 bg-surface-950">
          <Link href="/" onClick={() => setMenuOpen(false)} className="py-2.5 text-gray-200 font-medium">🏠 Bosh sahifa</Link>
          <Link href="/elonlar" onClick={() => setMenuOpen(false)} className="py-2.5 text-gray-200 font-medium">📋 Barcha e'lonlar</Link>
          <Link href="/tariflar" onClick={() => setMenuOpen(false)} className="py-2.5 text-gray-200 font-medium">💼 Tariflar</Link>
          {user && (
            <Link href="/kabinet" onClick={() => setMenuOpen(false)} className="py-2.5 text-gray-200 font-medium">👤 Kabinet</Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="py-2.5 text-gray-200 font-medium">🛡️ Admin panel</Link>
          )}
          <div className="border-t border-white/5 my-2" />
          {user ? (
            <>
              <Link href="/elon-qoshish" onClick={() => setMenuOpen(false)} className="btn-primary text-center !py-2.5 mb-2">
                + E'lon qo'shish
              </Link>
              <button onClick={handleLogout} className="text-red-400 font-medium py-2 text-left">
                Chiqish
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href="/kirish" onClick={() => setMenuOpen(false)} className="btn-secondary !bg-surface-900 !border-white/10 !text-gray-200 flex-1 text-center">Kirish</Link>
              <Link href="/royxatdan-otish" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center">Ro'yxat</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
