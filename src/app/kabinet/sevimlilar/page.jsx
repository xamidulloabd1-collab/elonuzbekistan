// app/kabinet/sevimlilar/page.jsx - Foydalanuvchining sevimli e'lonlari
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';

export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/kirish');
  }

  let listings = [];
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { listing: true },
    });
    // O'chirilgan yoki arxivlangan e'lonlarni ro'yxatdan chiqarib tashlaymiz
    listings = favorites.map((f) => f.listing).filter((l) => l && l.status === 'ACTIVE');
  } catch (err) {
    console.error('Sevimlilarni olishda xatolik:', err.message);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/kabinet" className="text-brand-600 dark:text-brand-400 font-semibold mb-4 inline-block text-sm">
        ← Kabinetga qaytish
      </Link>
      <h1 className="text-2xl font-bold mb-6">❤️ Sevimlilarim</h1>

      {listings.length === 0 ? (
        <p className="text-gray-400 py-16 text-center">
          Hali hech qanday e'lonni sevimlilarga qo'shmagansiz.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
