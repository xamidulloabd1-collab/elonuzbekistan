'use client';
// components/AdminPanel.jsx - Tasdiq kutayotgan arizalar (desktopda jadval, mobilda kartochka)

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { PLAN_LABELS } from '@/lib/labels';

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pending-requests');
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Arizalarni yuklab bo'lmadi");
        return;
      }
      setRequests(data.requests);
    } catch (err) {
      console.error(err);
      setError("Tarmoq xatoligi, internetni tekshiring");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRequests(); }, []);

  async function handleApprove(userId) {
    setApprovingId(userId);
    try {
      const res = await fetch(`/api/admin/approve-subscription/${userId}`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Tasdiqlashda xatolik yuz berdi");
        return;
      }

      setRequests((prev) => prev.filter((r) => r.id !== userId));
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      toast.error("Tarmoq xatoligi, internetni tekshiring");
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-xl sm:text-3xl font-extrabold">🛡️ Admin panel — Tasdiq kutayotgan arizalar</h1>
        <button onClick={loadRequests} className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      {error && <p className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg p-4 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400 py-10 text-center">Yuklanmoqda...</p>
      ) : requests.length === 0 && !error ? (
        <p className="text-gray-400 py-10 text-center">Hozircha tasdiq kutayotgan arizalar yo'q. ✅</p>
      ) : (
        <>
          {/* Desktop: jadval */}
          <div className="hidden sm:block card overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="py-3 px-4">Ism</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">So'ralgan tarif</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                    <td className="py-3 px-4 font-semibold">{r.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{r.phone}</td>
                    <td className="py-3 px-4">
                      <span className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-bold px-3 py-1 rounded-full">
                        {PLAN_LABELS[r.subscriptionPlan] || r.subscriptionPlan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={approvingId === r.id}
                        className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1 ml-auto disabled:opacity-60"
                      >
                        <CheckCircle size={14} /> {approvingId === r.id ? "Tasdiqlanmoqda..." : "Tasdiqlash (1 oy)"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobil: kartochkalar */}
          <div className="sm:hidden flex flex-col gap-3">
            {requests.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold">{r.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">📞 {r.phone}</p>
                  </div>
                  <span className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                    {PLAN_LABELS[r.subscriptionPlan]}
                  </span>
                </div>
                <button
                  onClick={() => handleApprove(r.id)}
                  disabled={approvingId === r.id}
                  className="btn-primary w-full !text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle size={14} /> {approvingId === r.id ? "Tasdiqlanmoqda..." : "Tasdiqlash (1 oy)"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
