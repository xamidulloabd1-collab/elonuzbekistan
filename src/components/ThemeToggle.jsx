'use client';
// components/ThemeToggle.jsx - Tungi/Kunduzgi rejim almashtirish tugmasi
//
// `dark` prop - navbar doim qorong'i fonda bo'lgani uchun, tugma ham
// har doim shu fonga mos (shaffof oq) uslubda ko'rsatiladi.

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ dark = false }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Rejimni almashtirish"
      className={
        dark
          ? 'w-9 h-9 flex items-center justify-center rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-brand-400 transition'
          : 'w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-surface-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition'
      }
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
