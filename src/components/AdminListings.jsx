'use client';
// components/AdminListings.jsx - Admin uchun e'lonlarni boshqarish
// (yashirish/qayta ko'rsatish yoki butunlay o'chirish)

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, EyeOff, Eye, Trash2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_LABELS, formatPrice } from '@/lib/labels';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load(searchValue = '') {
    setLoading(true);
    try {
      const url = searchValue ? `/api/admin/listings?search=${encodeURIComponent(searchValue)}` : '/api/admin/listings';
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setListings(data.listings);
      else toast.error(data.message || "E'lonlarni yuklab bo'lmadi");
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    load(search);
  }

  async function toggleStatus(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}/toggle-status`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Xatolik yuz berdi');
        return;
      }
      toast.success(data.message);
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: data.listing.status } : l)));
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteListing(id) {
    if (!confirm("Bu e'lonni BUTUNLAY o'chirmoqchimisiz? Bu amalni orqaga qaytarib bo'lmaydi.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "O'chirib bo'lmadi");
        return;
      }
      toast.success(data.message);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Tarmoq xatoligi');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sarlavha bo'yicha qidirish..."
          className="input-field !py-2 flex-1"
        />
        <button type="submit" className="btn-secondary !py-2 !px-4 flex items-center gap-1">
          <Search size={16} /> Qidirish
        </button>
        <button type="button" onClick={() => load(search)} className="btn-secondary !py-2 !px-3" aria-label="Yangilash">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400 py-8 text-center">Yuklanmoqda...</p>
      ) : listings.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">Hech qanday e'lon topilmadi.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {listings.map((listing) => (
            <div key={listing.id} className="card p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/elon/${listing.id}`} target="_blank" className="font-bold hover:underline line-clamp-1">
                  {listing.title}
                </Link>
                <p className="text-xs text-gray-400">
                  {CATEGORY_LABELS[listing.category]} · {formatPrice(listing.price, listing.currency)} ·{' '}
                  {listing.owner?.name} ({listing.owner?.phone})
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${
                  listing.status === 'ACTIVE'
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-surface-800 text-gray-500'
                }`}
              >
                {listing.status === 'ACTIVE' ? 'Faol' : 'Yashirilgan'}
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => toggleStatus(listing.id)}
                  disabled={busyId === listing.id}
                  className="btn-secondary !py-1.5 !px-3 !text-xs flex items-center gap-1"
                >
                  {listing.status === 'ACTIVE' ? <EyeOff size={14} /> : <Eye size={14} />}
                  {listing.status === 'ACTIVE' ? 'Yashirish' : "Ko'rsatish"}
                </button>
                <button
                  onClick={() => deleteListing(listing.id)}
                  disabled={busyId === listing.id}
                  className="!py-1.5 !px-3 !text-xs rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-1 transition"
                >
                  <Trash2 size={14} /> O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
