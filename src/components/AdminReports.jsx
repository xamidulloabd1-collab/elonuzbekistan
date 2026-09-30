'use client';
// components/AdminReports.jsx - Admin panelidagi "Shikoyatlar" bo'limi
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { REPORT_REASON_LABELS } from '@/lib/labels';

export default function AdminReports() {
  const [status, setStatus] = useState('OPEN');
  const [reports, setReports] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setReports(null);
    try {
      const res = await fetch(`/api/admin/reports?status=${status}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReports(data.reports);
    } catch (err) {
      toast.error(err.message || "Yuklab bo'lmadi");
      setReports([]);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(id, action) {
    if (action === 'hide_listing' && !window.confirm("E'lonni yashirasizmi?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(err.message || 'Xatolik');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {[
          ['OPEN', "🚩 Ko'rib chiqilmagan"],
          ['RESOLVED', '✅ Hal qilingan'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              status === key ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {reports === null ? (
        <p className="text-center py-10 text-gray-400">Yuklanmoqda...</p>
      ) : reports.length === 0 ? (
        <p className="text-center py-10 text-gray-400">{status === 'OPEN' ? "Yangi shikoyat yo'q 🎉" : "Hali hal qilingan shikoyat yo'q"}</p>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="card p-4 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">{REPORT_REASON_LABELS[r.reason]}</span>
              <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString('uz-UZ')}</span>
            </div>
            {r.listing ? (
              <p className="text-sm">
                📦 E'lon:{' '}
                <Link href={`/elon/${r.listing.id}`} target="_blank" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  {r.listing.title}
                </Link>{' '}
                <span className="text-xs text-gray-400">({r.listing.status})</span>
              </p>
            ) : (
              r.listingId === null && <p className="text-sm text-gray-400">E'lon yo'q (foydalanuvchi ustidan shikoyat)</p>
            )}
            {r.reportedUser && (
              <p className="text-sm">
                👤 Kim ustidan: <b>{r.reportedUser.name}</b> <span className="text-gray-400">({r.reportedUser.phone})</span>
              </p>
            )}
            {r.details && <p className="text-sm bg-gray-50 dark:bg-white/5 rounded-lg p-2">💬 {r.details}</p>}
            <p className="text-xs text-gray-400">
              Kimdan: {r.reporter.name} ({r.reporter.phone})
            </p>
            {status === 'OPEN' && (
              <div className="flex flex-wrap gap-2 pt-1">
                {r.listing && r.listing.status === 'ACTIVE' && (
                  <button
                    onClick={() => act(r.id, 'hide_listing')}
                    disabled={busy === r.id}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-500 text-white disabled:opacity-50"
                  >
                    E'lonni yashirish
                  </button>
                )}
                <button
                  onClick={() => act(r.id, 'resolve')}
                  disabled={busy === r.id}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-100 dark:bg-white/10 disabled:opacity-50"
                >
                  Hal qilindi
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
