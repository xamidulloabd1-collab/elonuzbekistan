// app/elon/[id]/page.jsx - E'lon tafsilotlari sahifasi
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Eye, Calendar, User as UserIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { CATEGORY_LABELS, REGION_LABELS, formatPrice } from '@/lib/labels';
import ImageGallery from '@/components/ImageGallery';
import ContactActions from '@/components/ContactActions';
import FavoriteButton from '@/components/FavoriteButton';
import ShareButton from '@/components/ShareButton';
import ListingCard from '@/components/ListingCard';

export const dynamic = 'force-dynamic';

async function getListing(id) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, phone: true, telegramUsername: true, createdAt: true } },
      },
    });

    if (!listing || listing.status !== 'ACTIVE') return null;

    // Ko'rishlar sonini oshiramiz (natijani kutmasdan - sahifa tezroq ochilishi uchun)
    prisma.listing
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch((err) => console.error('Views oshirishda xatolik:', err.message));

    return { ...listing, views: listing.views + 1 };
  } catch (err) {
    console.error("E'lonni olishda xatolik:", err.message);
    return null;
  }
}

// Bir xil kategoriyadagi boshqa faol e'lonlar - "shunga o'xshash" bloki uchun
async function getSimilarListings(listing) {
  try {
    return await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        category: listing.category,
        id: { not: listing.id },
      },
      orderBy: [{ isVip: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    });
  } catch (err) {
    console.error("O'xshash e'lonlarni olishda xatolik:", err.message);
    return [];
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ListingDetailPage({ params }) {
  const listing = await getListing(params.id);

  if (!listing) {
    notFound();
  }

  const similarListings = await getSimilarListings(listing);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const shareUrl = `${siteUrl}/elon/${listing.id}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/elonlar" className="text-brand-600 dark:text-brand-400 font-semibold mb-4 inline-block text-sm">
        ← Barcha e'lonlarga qaytish
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <ImageGallery images={listing.images} title={listing.title} />

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-bold px-3 py-1 rounded-full">
                {CATEGORY_LABELS[listing.category]}
              </span>
              <div className="flex items-center gap-2">
                <FavoriteButton listingId={listing.id} className="!static" />
                <ShareButton url={shareUrl} title={listing.title} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-2">{listing.title}</h1>
            <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 mb-4">
              {formatPrice(listing.price, listing.currency)}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center gap-1"><MapPin size={14} /> {REGION_LABELS[listing.region]}</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {listing.views} marta ko'rilgan</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(listing.createdAt)}</span>
            </div>

            <h2 className="font-bold mb-2">Tavsif</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        <div>
          <div className="card p-5 sticky top-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <UserIcon className="text-brand-600 dark:text-brand-400" size={22} />
              </div>
              <div>
                <p className="font-bold">{listing.owner.name}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(listing.owner.createdAt)}dan beri a'zo
                </p>
              </div>
            </div>

            <ContactActions
              phone={listing.contactPhone}
              telegramUsername={listing.owner.telegramUsername}
            />
          </div>
        </div>
      </div>

      {similarListings.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Shunga o'xshash e'lonlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {similarListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
