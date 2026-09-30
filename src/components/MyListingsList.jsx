'use client';
// components/MyListingsList.jsx - Kabinetdagi "mening e'lonlarim" ro'yxati
// (o'chirish amalini boshqaradi - muvaffaqiyatli o'chirilgach ro'yxatdan olib tashlaydi)

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Eye, ImageOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatPrice, CATEGORY_LABELS, LISTING_STATUS_LABELS } from '@/lib/labels';

const daysLeft = (d) => (d ? Math.ceil((new Date(d) - Date.now()) / 86400000) : null);

function StatusBadge({ listing }) {
  const left = daysLeft(listing.expiresAt);
  if (listing.status === 'ACTIVE') {
    const soon = left !== null && left <= 3;
    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${soon ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'}`}>
        Faol{left !== null ? ` · ${Math.max(left, 0)} kun qoldi` : ''}
      </span>
    );
  }
  const styles = {
    SOLD: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    EXPIRED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300',
    ARCHIVED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  };
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles[listing.status] || ''}`}>{listing.status === 'SOLD' ? '✅ ' : ''}{LISTING_STATUS_LABELS[listing.status]}</span>;
}

export default function MyListingsList({ initialListings }) {
  const [listings, setListings] = useState(initialListings);
  const [deletingId, setDeletingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function handleStatus(id, action) {
    if (action === 'sold' && !window.confirm("E'lonni \"Sotildi\" deb belgilaysizmi? U saytdan yashiriladi.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Xatolik yuz berdi');
        return;
      }
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, ...data.listing } : l)));
      toast.success(action === 'sold' ? 'Tabriklaymiz! 🎉 E\'lon "Sotildi" deb belgilandi' : "E'lon yana 30 kunga uzaytirildi");
    } catch {
      toast.error('Tarmoq xatoligi, internetni tekshiring');
    } finally {
      setBusyId(null);
    }
  }

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
        <div key={listing.id} className={`card p-4 flex items-center gap-4 ${listing.status !== 'ACTIVE' ? 'opacity-80' : ''}`}>
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
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge listing={listing} />
              {listing.status === 'ACTIVE' && (
                <button
                  onClick={() => handleStatus(listing.id, 'sold')}
                  disabled={busyId === listing.id}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCircle2 size={13} /> Sotildi
                </button>
              )}
              {(listing.status === 'EXPIRED' || (listing.status === 'ACTIVE' && daysLeft(listing.expiresAt) !== null && daysLeft(listing.expiresAt) <= 7)) && (
                <button
                  onClick={() => handleStatus(listing.id, 'renew')}
                  disabled={busyId === listing.id}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <RefreshCw size={13} /> {listing.status === 'EXPIRED' ? 'Qayta faollashtirish' : 'Yana 30 kun'}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0 self-start sm:self-center">
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
