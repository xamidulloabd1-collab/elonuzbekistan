'use client';
// components/FilterBar.jsx - E'lonlar sahifasidagi filtr paneli
// (kategoriya, hudud, narx oralig'i) - URL query parametrlar orqali ishlaydi,
// shunda filtrlangan sahifa havolasini do'stlarga yuborish ham mumkin.

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { CATEGORY_LABELS, REGION_LABELS } from '@/lib/labels';
import { DISTRICTS } from '@/data/districts';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [exchangeable, setExchangeable] = useState(searchParams.get('exchangeable') === '1');
  const [installment, setInstallment] = useState(searchParams.get('installment') === '1');

  function applyFilters(e) {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    const setOrDelete = (key, value) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };

    setOrDelete('category', category);
    setOrDelete('region', region);
    setOrDelete('minPrice', minPrice);
    setOrDelete('maxPrice', maxPrice);
    setOrDelete('district', region ? district : '');
    setOrDelete('exchangeable', exchangeable ? '1' : '');
    setOrDelete('installment', installment ? '1' : '');
    params.delete('page'); // filtr o'zgarganda birinchi sahifaga qaytamiz

    router.push(`/elonlar?${params.toString()}`);
    setOpen(false);
  }

  function clearFilters() {
    setCategory(''); setRegion(''); setMinPrice(''); setMaxPrice('');
    setDistrict(''); setExchangeable(false); setInstallment(false);
    const params = new URLSearchParams(searchParams.toString());
    const search = params.get('search');
    router.push(search ? `/elonlar?search=${search}` : '/elonlar');
    setOpen(false);
  }

  const activeCount = [category, region, minPrice, maxPrice, district, exchangeable, installment].filter(Boolean).length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2"
      >
        <SlidersHorizontal size={16} />
        Filtrlar {activeCount > 0 && <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeCount}</span>}
      </button>

      {open && (
        <form onSubmit={applyFilters} className="card p-4 mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Kategoriya</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field !py-2">
              <option value="">Barchasi</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Hudud</label>
            <select value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(''); }} className="input-field !py-2">
              <option value="">Barchasi</option>
              {Object.entries(REGION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Narx (dan)</label>
            <input
              type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0" className="input-field !py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Narx (gacha)</label>
            <input
              type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Cheklanmagan" className="input-field !py-2"
            />
          </div>

          {region && DISTRICTS[region] && (
            <div>
              <label className="block text-sm font-semibold mb-1">Tuman / shahar</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input-field !py-2">
                <option value="">Barchasi</option>
                {DISTRICTS[region].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={installment} onChange={(e) => setInstallment(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
              💳 Bo'lib to'lash bor
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={exchangeable} onChange={(e) => setExchangeable(e.target.checked)} className="w-4 h-4 accent-purple-600" />
              🔄 Almashtirish mumkin
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex gap-2 justify-end">
            <button type="button" onClick={clearFilters} className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-1">
              <X size={14} /> Tozalash
            </button>
            <button type="submit" className="btn-primary !py-2 !px-6 !text-sm">Qo'llash</button>
          </div>
        </form>
      )}
    </div>
  );
}
