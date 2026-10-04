'use client';
// components/ListingQualityMeter.jsx - "E'loningiz 60% tayyor" ko'rsatkichi va maslahatlar

export function listingQuality(form) {
  const checks = [
    { ok: (form.title || '').trim().length >= 15, points: 10, tip: "Sarlavhaga ko'proq aniqlik qo'shing (masalan: model, yil, rang)" },
    { ok: Boolean(form.category && form.region), points: 10, tip: 'Kategoriya va hududni tanlang' },
    { ok: Number(form.price) > 0, points: 10, tip: 'Narxni kiriting' },
    { ok: (form.description || '').trim().length >= 80, points: 20, tip: "Tavsifni batafsilroq yozing (kamida 80 belgi) — yoki ✨ tugmasidan foydalaning" },
    { ok: (form.images || []).length >= 1, points: 15, tip: "Kamida bitta rasm qo'shing" },
    { ok: (form.images || []).length >= 3, points: 15, tip: "Yana rasm qo'shing — rasmlar ko'p bo'lsa, xaridor ko'proq ishonadi" },
    { ok: form.latitude != null && form.latitude !== '', points: 10, tip: 'Xaritada joylashuvni belgilang' },
    { ok: Boolean(form.district), points: 10, tip: 'Tuman yoki shaharni tanlang' },
  ];
  const score = checks.reduce((s, c) => s + (c.ok ? c.points : 0), 0);
  return { score, tips: checks.filter((c) => !c.ok).map((c) => c.tip) };
}

export default function ListingQualityMeter({ form }) {
  const { score, tips } = listingQuality(form);
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const label = score >= 80 ? "Zo'r e'lon! 🎉" : score >= 50 ? 'Yaxshi, lekin yana yaxshilash mumkin' : "E'lonni to'ldiring";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm">E'loningiz {score}% tayyor</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
      {tips.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
          {tips.slice(0, 3).map((t) => (
            <li key={t}>💡 {t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
