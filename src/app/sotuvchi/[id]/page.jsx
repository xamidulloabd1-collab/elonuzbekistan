// app/sotuvchi/[id]/page.jsx - Ochiq sotuvchi profili (barchaga ko'rinadi)
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { User as UserIcon, Calendar, Package } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';

export const dynamic = 'force-dynamic';

async function getSellerData(id) {
  try {
    const seller = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, createdAt: true, subscriptionPlan: true, subscriptionStatus: true, phoneVerified: true },
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
  const isBusiness = seller.subscriptionStatus === 'ACTIVE' && seller.subscriptionPlan === 'BIZNES';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
        <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0">
          <UserIcon className="text-brand-600 dark:text-brand-400" size={36} />
        </div>
        <div>
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <h1 className="text-2xl font-bold">{seller.name}</h1>
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
