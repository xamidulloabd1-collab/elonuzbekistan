'use client';
// context/FavoritesContext.jsx - Foydalanuvchining "sevimli" e'lonlari
// ID'lari holatini saqlaydi (faqat ID'lar - yengil), shunda ListingCard va
// e'lon sahifasidagi yurak (❤️) belgisi darhol to'g'ri holatda ko'rinadi.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      setLoaded(true);
      return;
    }
    try {
      const res = await fetch('/api/favorites/ids');
      const data = await res.json();
      setIds(new Set(data.ids || []));
    } catch (err) {
      console.error('Sevimlilarni yuklashda xatolik:', err);
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isFavorite(listingId) {
    return ids.has(listingId);
  }

  async function toggle(listingId) {
    if (!user) return false; // chaqiruvchi (FavoriteButton) tizimga kirishni so'raydi

    const currentlyFavorite = ids.has(listingId);
    // Optimistik yangilash - foydalanuvchi darhol natijani ko'radi
    setIds((prev) => {
      const next = new Set(prev);
      currentlyFavorite ? next.delete(listingId) : next.add(listingId);
      return next;
    });

    try {
      await fetch(`/api/favorites/${listingId}`, { method: currentlyFavorite ? 'DELETE' : 'POST' });
    } catch (err) {
      console.error('Sevimlilarni yangilashda xatolik:', err);
      // Xato bo'lsa, orqaga qaytaramiz
      setIds((prev) => {
        const next = new Set(prev);
        currentlyFavorite ? next.add(listingId) : next.delete(listingId);
        return next;
      });
    }
    return !currentlyFavorite;
  }

  return (
    <FavoritesContext.Provider value={{ isFavorite, toggle, loaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
