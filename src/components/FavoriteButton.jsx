'use client';
// components/FavoriteButton.jsx - Sevimlilarga qo'shish/olib tashlash tugmasi
// (yurak belgisi). ListingCard va e'lon tafsilotlari sahifasida ishlatiladi.

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';

export default function FavoriteButton({ listingId, size = 18, className = '' }) {
  const { user } = useAuth();
  const favorites = useFavorites();
  const router = useRouter();

  if (!favorites) return null; // FavoritesProvider hali yuklanmagan bo'lishi mumkin

  const active = favorites.isFavorite(listingId);

  async function handleClick(e) {
    e.preventDefault(); // ota Link'ga o'tishning oldini olamiz (kartochka ichida bo'lsa)
    e.stopPropagation();

    if (!user) {
      toast("Sevimlilarga qo'shish uchun tizimga kiring");
      router.push('/kirish');
      return;
    }
    const nowActive = await favorites.toggle(listingId);
    toast.success(nowActive ? "Sevimlilarga qo'shildi" : "Sevimlilardan olib tashlandi");
  }

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
      className={`p-2 rounded-full bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform ${className}`}
    >
      <Heart
        size={size}
        className={active ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
        fill={active ? 'currentColor' : 'none'}
      />
    </button>
  );
}
