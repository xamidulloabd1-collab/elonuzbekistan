'use client';
// components/AdminTabs.jsx - Admin sahifasidagi ikkita bo'lim orasida almashish
// (Statistika / Tarif arizalari / E'lonlarni boshqarish)

import { useState } from 'react';
import AdminPanel from './AdminPanel';
import AdminListings from './AdminListings';
import AdminStats from './AdminStats';

export default function AdminTabs() {
  const [tab, setTab] = useState('stats');

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10 overflow-x-auto">
        <button
          onClick={() => setTab('stats')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
            tab === 'stats'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          📊 Statistika
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition ${
            tab === 'requests'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          📋 Tarif arizalari
        </button>
        <button
          onClick={() => setTab('listings')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition ${
            tab === 'listings'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          🛡️ E'lonlarni boshqarish
        </button>
      </div>

      {tab === 'stats' ? <AdminStats /> : tab === 'requests' ? <AdminPanel /> : <AdminListings />}
    </div>
  );
}
