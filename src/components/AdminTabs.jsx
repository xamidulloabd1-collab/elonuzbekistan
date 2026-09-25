'use client';
// components/AdminTabs.jsx - Admin sahifasidagi ikkita bo'lim orasida almashish
// (Tarif arizalari / E'lonlarni boshqarish)

import { useState } from 'react';
import AdminPanel from './AdminPanel';
import AdminListings from './AdminListings';

export default function AdminTabs() {
  const [tab, setTab] = useState('requests');

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10">
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

      {tab === 'requests' ? <AdminPanel /> : <AdminListings />}
    </div>
  );
}
