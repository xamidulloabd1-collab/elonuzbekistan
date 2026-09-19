'use client';
// components/SearchBar.jsx - Bosh sahifadagi katta qidiruv satri
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar({ compact = false }) {
  const [value, setValue] = useState('');
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set('search', value.trim());
    router.push(`/elonlar?${params.toString()}`);
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Qidirish..."
          className="input-field !py-2"
        />
        <button type="submit" className="btn-secondary !py-2 !px-4 flex items-center gap-1">
          <Search size={16} />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nima qidiryapsiz? Masalan: Chevrolet Cobalt"
        className="flex-1 rounded-xl py-4 px-5 text-base text-gray-800 bg-white focus:outline-none focus:ring-4 focus:ring-brand-400/30 shadow-glow"
      />
      <button type="submit" className="btn-primary !rounded-xl !py-0 px-5 sm:px-8 flex items-center gap-2">
        <Search size={18} /> <span className="hidden sm:inline">Qidirish</span>
      </button>
    </form>
  );
}
