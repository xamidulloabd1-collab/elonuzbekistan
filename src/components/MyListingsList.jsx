'use client';
// components/MyListingsList.jsx - Kabinetdagi "mening e'lonlarim" ro'yxati
// (o'chirish amalini boshqaradi - muvaffaqiyatli o'chirilgach ro'yxatdan olib tashlaydi)

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Eye, ImageOff } from 'lucide-react';
import { formatPrice, CATEGORY_LABELS } from '@/lib/labels';

export default function MyListingsList({ initialListings }) {
  const [listings, setListings] = useState(initialListings);
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id) {
    if (!window.confirm("Rostdan ham bu e'lonni o'chirmoqchimisiz?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "O'chirishda xatolik yuz berdi");
        return;
      }

      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("E'lon o'chirildi");
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatoligi, internetni tekshiring");
    } finally {
      setDeletingId(null);
    }
  }

  if (listings.length === 0) {
    return <p className="text-gray-400 py-10 text-center">Sizda hali e'lonlar yo'q.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {listings.map((listing) => (
        <div key={listing.id} className="card p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-surface-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            {listing.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <ImageOff className="text-gray-300 dark:text-gray-600" size={24} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <Link href={`/elon/${listing.id}`} className="font-bold hover:text-brand-600 dark:hover:text-brand-400 truncate block">
              {listing.title}
            </Link>
            <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
              {formatPrice(listing.price, listing.currency)}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              {CATEGORY_LABELS[listing.category]} · <Eye size={12} className="inline" /> {listing.views}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link
              href={`/elon/${listing.id}/tahrirlash`}
              className="bg-gray-100 dark:bg-surface-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg"
              aria-label="Tahrirlash"
            >
              <Pencil size={16} />
            </Link>
            <button
              onClick={() => handleDelete(listing.id)}
              disabled={deletingId === listing.id}
              className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-lg disabled:opacity-50"
              aria-label="O'chirish"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
