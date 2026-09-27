'use client';
// components/AdminStats.jsx - Admin panelidagi "Statistika" bo'limi:
// foydalanuvchilar, e'lonlar, tashriflar, daromad va oylik o'sish grafiklari

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CATEGORY_LABELS, REGION_LABELS, PLAN_LABELS } from '@/lib/labels';

const fmt = (n) => Number(n || 0).toLocaleString('uz-UZ');
const MONTHS_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const monthLabel = (m) => MONTHS_UZ[Number(m.slice(5, 7)) - 1];

function StatCard({ icon, title, value, rows }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {icon} {title}
      </div>
      <div className="text-3xl font-extrabold mt-1">{value}</div>
      {rows && (
        <div className="mt-3 flex flex-col gap-1 text-sm">
          {rows.map(([label, v]) => (
            <div key={label} className="flex justify-between gap-2">
              <span className="text-gray-500 dark:text-gray-400">{label}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Bars({ data, valueKey, labelFn, color = 'bg-brand-500', height = 160 }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-1 sm:gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const v = d[valueKey];
        const label = labelFn(d, i);
        return (
          <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-1 min-w-0" title={`${label}: ${fmt(v)}`}>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">{v > 0 ? fmt(v) : ''}</span>
            <div className={`w-full rounded-t ${color}`} style={{ height: `${Math.max(v > 0 ? 3 : 0, (v / max) * 100)}%` }} />
            <span className="text-[10px] text-gray-400 leading-none truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function HBars({ items, labels }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  if (!items.length) return <p className="text-sm text-gray-400">Hozircha ma'lumot yo'q</p>;
  return (
    <div className="flex flex-col gap-2">
      {items.map((it) => (
        <div key={it.key} className="text-sm">
          <div className="flex justify-between mb-0.5">
            <span>{labels[it.key] || it.key}</span>
            <span className="font-semibold">{fmt(it.count)}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${(it.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const SERIES = [
  { key: 'users', label: 'Yangi foydalanuvchilar', color: 'bg-brand-500' },
  { key: 'listings', label: "Yangi e'lonlar", color: 'bg-emerald-500' },
  { key: 'visits', label: 'Tashriflar', color: 'bg-amber-500' },
];

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState('users');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json);
    } catch (err) {
      toast.error(err.message || "Statistikani yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function copyReport() {
    const lines = [
      `E'lonUz statistikasi — ${new Date(data.generatedAt).toLocaleDateString('uz-UZ')}`,
      '',
      `Foydalanuvchilar: ${fmt(data.users.total)} (oxirgi 30 kunda +${fmt(data.users.last30)})`,
      `Faol e'lonlar: ${fmt(data.listings.active)} (oxirgi 30 kunda +${fmt(data.listings.last30)})`,
      `Tashriflar (30 kun): ${fmt(data.visits.last30)}, sahifa ko'rishlar: ${fmt(data.visits.views30)}`,
      `Taxminiy oylik daromad: ${fmt(data.revenue.monthlyRevenue)} so'm`,
      '',
      'Oy | Foydalanuvchilar | E\'lonlar | Tashriflar',
      ...data.monthly.map((m) => `${m.month} | ${m.users} | ${m.listings} | ${m.visits}`),
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(
      () => toast.success('Hisobot nusxalandi'),
      () => toast.error("Nusxalab bo'lmadi")
    );
  }

  if (loading && !data) return <p className="text-center py-16 text-gray-400">Yuklanmoqda...</p>;
  if (!data) {
    return (
      <div className="text-center py-16">
        <button onClick={load} className="btn-primary">Qayta urinish</button>
      </div>
    );
  }

  const { users, listings, visits, revenue, chat, monthly } = data;
  const activeSeries = SERIES.find((s) => s.key === series);
  const activeSubs = revenue.subscriptions.TADBIRKOR + revenue.subscriptions.BIZNES;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">📊 Platforma statistikasi</h2>
        <div className="flex gap-2">
          <button onClick={copyReport} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5">
            📋 Hisobotni nusxalash
          </button>
          <button onClick={load} disabled={loading} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-white/5">
            {loading ? '...' : '🔄 Yangilash'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          title="Foydalanuvchilar"
          value={fmt(users.total)}
          rows={[
            ['Bugun', `+${fmt(users.today)}`],
            ['7 kunda', `+${fmt(users.last7)}`],
            ['30 kunda', `+${fmt(users.last30)}`],
            ['Raqami tasdiqlangan', fmt(users.verified)],
            ['Referal orqali', fmt(users.referred)],
          ]}
        />
        <StatCard
          icon="📦"
          title="Faol e'lonlar"
          value={fmt(listings.active)}
          rows={[
            ['Bugun', `+${fmt(listings.today)}`],
            ['7 kunda', `+${fmt(listings.last7)}`],
            ['30 kunda', `+${fmt(listings.last30)}`],
            ['VIP (faol)', fmt(listings.vip)],
            ['Jami (arxiv bilan)', fmt(listings.total)],
          ]}
        />
        <StatCard
          icon="👀"
          title="Tashriflar (30 kun)"
          value={fmt(visits.last30)}
          rows={[
            ['Bugun', fmt(visits.today)],
            ['7 kunda', fmt(visits.last7)],
            ["Sahifa ko'rishlar (30 kun)", fmt(visits.views30)],
            ['Chatdagi suhbatlar', fmt(chat.conversations)],
            ['Xabarlar (30 kun)', fmt(chat.messages30)],
          ]}
        />
        <StatCard
          icon="💰"
          title="Taxminiy oylik daromad"
          value={`${fmt(revenue.monthlyRevenue)} so'm`}
          rows={[
            ['Faol obunalar', fmt(activeSubs)],
            [PLAN_LABELS.TADBIRKOR, fmt(revenue.subscriptions.TADBIRKOR)],
            [PLAN_LABELS.BIZNES, fmt(revenue.subscriptions.BIZNES)],
          ]}
        />
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-bold">Oxirgi 12 oy</h3>
          <div className="flex flex-wrap gap-1.5">
            {SERIES.map((s) => (
              <button
                key={s.key}
                onClick={() => setSeries(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  series === s.key ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <Bars data={monthly} valueKey={series} labelFn={(d) => monthLabel(d.month)} color={activeSeries.color} />
      </div>

      <div className="card p-4 sm:p-5">
        <h3 className="font-bold mb-4">Kunlik tashriflar (30 kun)</h3>
        <Bars data={visits.daily} valueKey="visits" labelFn={(d) => d.day.slice(8)} color="bg-amber-500" height={130} />
        <p className="text-xs text-gray-400 mt-3">
          Tashrif — bir kishining bir kundagi kirishi. Hisoblash shu yangilanishdan keyin boshlanadi; IP manzillar saqlanmaydi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 sm:p-5">
          <h3 className="font-bold mb-4">Kategoriyalar bo'yicha (faol)</h3>
          <HBars items={listings.byCategory} labels={CATEGORY_LABELS} />
        </div>
        <div className="card p-4 sm:p-5">
          <h3 className="font-bold mb-4">Hududlar bo'yicha (faol)</h3>
          <HBars items={listings.byRegion} labels={REGION_LABELS} />
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Daromad faol obunalar soni × tarif narxi bo'yicha hisoblanadi (taxminiy). Oxirgi yangilanish:{' '}
        {new Date(data.generatedAt).toLocaleString('uz-UZ')}
      </p>
    </div>
  );
}
