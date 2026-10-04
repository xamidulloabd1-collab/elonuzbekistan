// app/sotuvchi/[id]/page.jsx - Ochiq sotuvchi profili (barchaga ko'rinadi)
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { User as UserIcon, Calendar, Package } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { hasActivePlan } from '@/lib/subscription';
import ListingCard from '@/components/ListingCard';

export const dynamic = 'force-dynamic';

async function getSellerData(id) {
  try {
    const seller = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, createdAt: true, subscriptionPlan: true, subscriptionStatus: true, subscriptionExpiresAt: true, phoneVerified: true,
        shopName: true, shopLogo: true, shopAddress: true, shopHours: true, shopDescription: true,
      },
    });
    if (!seller) return null;

    const listings = await prisma.listing.findMany({
      where: { ownerId: id, status: 'ACTIVE' },
      orderBy: [{ isVip: 'desc' }, { createdAt: 'desc' }],
    });

    return { seller, listings };
  } catch (err) {
    console.error("Sotuvchi profilini olishda xatolik:", err.message);
    return null;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function SellerProfilePage({ params }) {
  const data = await getSellerData(params.id);
  if (!data) notFound();

  const { seller, listings } = data;
  const isBusiness = hasActivePlan(seller, 'BIZNES');
  // Do'kon ko'rinishi: faqat faol Biznes tarifi va do'kon nomi kiritilgan bo'lsa
  const shop = isBusiness && seller.shopName ? seller : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {shop && (
        <div className="relative overflow-hidden rounded-3xl bg-surface-950 text-white p-6 sm:p-8 mb-6">
          <div className="glow-orb w-72 h-72 bg-brand-500/30 -top-24 -right-16" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-24 h-24 rounded-2xl bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {shop.shopLogo ? <img src={shop.shopLogo} alt={shop.shopName} className="w-full h-full object-cover" /> : <span className="text-4xl">🏪</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold tracking-widest text-brand-400 mb-1">🏢 RASMIY DO'KON</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{shop.shopName}</h1>
              <div className="flex flex-col gap-1 mt-2 text-sm text-gray-300">
                {shop.shopAddress && <span>📍 {shop.shopAddress}</span>}
                {shop.shopHours && <span>🕘 {shop.shopHours}</span>}
              </div>
              {shop.shopDescription && <p className="mt-3 text-gray-300 whitespace-pre-line max-w-2xl">{shop.shopDescription}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0">
          <UserIcon className="text-brand-600 dark:text-brand-400" size={36} />
        </div>
        <div>
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <h1 className={shop ? 'text-xl font-bold' : 'text-2xl font-bold'}>{seller.name}</h1>
            {seller.phoneVerified && (
              <span className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full">
                ✓ Raqami tasdiqlangan
              </span>
            )}
            {isBusiness && (
              <span className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-bold px-2.5 py-1 rounded-full">
                🏢 Biznes hamkor
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1 justify-center sm:justify-start">
            <Calendar size={14} /> {formatDate(seller.createdAt)}dan beri a'zo
          </p>
          <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1 justify-center sm:justify-start">
            <Package size={14} /> {listings.length} ta faol e'lon
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">{seller.name}ning e'lonlari</h2>

      {listings.length === 0 ? (
        <p className="text-gray-400 py-16 text-center">Hozircha faol e'lonlar yo'q.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <Link href="/elonlar" className="text-brand-600 dark:text-brand-400 font-semibold text-sm mt-8 inline-block">
        ← Barcha e'lonlarga qaytish
      </Link>
    </div>
  );
}
