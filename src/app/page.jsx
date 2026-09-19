// app/page.jsx - Bosh sahifa (server komponent - to'g'ridan-to'g'ri bazadan o'qiydi)
import Link from 'next/link';
import { ShieldCheck, Zap, TrendingUp } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { CATEGORY_LABELS } from '@/lib/labels';
import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';

export const dynamic = 'force-dynamic';

async function getRecentListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ isVip: 'desc' }, { createdAt: 'desc' }],
      take: 12,
    });
  } catch (err) {
    console.error("Ommabop e'lonlarni olishda xatolik:", err.message);
    return [];
  }
}

async function getStats() {
  try {
    const [listingCount, userCount] = await Promise.all([
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count(),
    ]);
    return { listingCount, userCount };
  } catch {
    return { listingCount: 0, userCount: 0 };
  }
}

export default async function HomePage() {
  const [listings, stats] = await Promise.all([getRecentListings(), getStats()]);

  return (
    <div>
      {/* ===== HERO: qora fon + ko'k "porlash" doiralar (logotipga mos, premium his) ===== */}
      <section className="relative overflow-hidden bg-surface-950 text-white py-16 sm:py-24 px-4">
        <div className="glow-orb w-[420px] h-[420px] bg-brand-600/40 -top-32 -left-32" />
        <div className="glow-orb w-[420px] h-[420px] bg-brand-400/30 top-10 -right-32" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold tracking-widest text-brand-400 bg-brand-400/10 border border-brand-400/20 rounded-full px-4 py-1.5 mb-5">
            BUY · SELL · ONLINE
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Buyumlaringiz uchun <span className="text-gradient">eng yaxshi joy</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Ko'chmas mulk, transport, elektronika va boshqa yuzlab e'lonlar — bir joyda,
            bir necha soniyada.
          </p>
          <SearchBar />

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10 text-sm text-gray-400">
            <span className="flex items-center gap-2"><TrendingUp size={16} className="text-brand-400" /> {stats.listingCount}+ faol e'lon</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand-400" /> {stats.userCount}+ foydalanuvchi</span>
            <span className="flex items-center gap-2"><Zap size={16} className="text-brand-400" /> Bepul e'lon joylash</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* ===== Kategoriyalar ===== */}
        <section className="py-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Kategoriyalar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/elonlar?category=${key}`}
                className="group relative card p-4 sm:p-5 flex items-center justify-center text-center font-semibold
                           hover:-translate-y-1 hover:shadow-glow-sm hover:border-brand-400/40 transition-all"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        {/* ===== So'nggi e'lonlar ===== */}
        <section className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">🔥 So'nggi e'lonlar</h2>
            <Link href="/elonlar" className="text-brand-600 dark:text-brand-400 font-semibold text-sm hover:underline">
              Barchasini ko'rish →
            </Link>
          </div>

          {listings.length === 0 ? (
            <p className="text-gray-400 py-10 text-center">
              Hozircha e'lonlar yo'q. Birinchi bo'lib e'lon joylang!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* ===== Tarif taklifi (past-sahifa CTA) ===== */}
        <section className="py-12">
          <div className="relative overflow-hidden rounded-3xl bg-surface-950 text-white p-8 sm:p-12 text-center">
            <div className="glow-orb w-72 h-72 bg-brand-500/40 -bottom-20 left-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Biznesingizni tezroq rivojlantiring</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Biznes/Makler tarifiga o'ting — e'lonlaringiz avtomatik ⭐ VIP bo'lib,
                har doim ro'yxat boshida chiqadi.
              </p>
              <Link href="/tariflar" className="btn-primary inline-block">
                Tariflarni ko'rish
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
