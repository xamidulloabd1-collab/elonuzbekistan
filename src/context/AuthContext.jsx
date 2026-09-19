'use client';
// context/AuthContext.jsx - Joriy foydalanuvchi holatini boshqaradi.
//
// Eslatma: token httpOnly cookie'da saqlanadi (localStorage emas), shuning
// uchun bu yerda token bilan qo'lda ishlashning hojati yo'q - brauzer uni
// avtomatik har bir so'rovga qo'shib yuboradi. Bu yerda faqat "joriy
// foydalanuvchi kim" degan holatni saqlaymiz.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const data = await res.json();
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('Foydalanuvchini yuklashda xatolik:', err);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Chiqishda xatolik:', err);
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
