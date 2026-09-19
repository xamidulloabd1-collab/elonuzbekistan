// app/elonlar/page.jsx - Qidiruv/filtr natijalari bilan e'lonlar ro'yxati
import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';
import FilterBar from '@/components/FilterBar';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { CATEGORY_LABELS } from '@/lib/labels';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

async function getListings(searchParams) {
  const search = searchParams.search?.trim();
  const category = searchParams.category;
  const region = searchParams.region;
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where = { status: 'ACTIVE' };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (category) where.category = category;
  if (region) where.region = region;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  try {
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: [{ isVip: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.listing.count({ where }),
    ]);
    return { listings, total, page, totalPages: Math.ceil(total / PAGE_SIZE) || 1 };
  } catch (err) {
    console.error("E'lonlarni olishda xatolik:", err.message);
    return { listings: [], total: 0, page: 1, totalPages: 1 };
  }
}

export default async function ListingsPage({ searchParams }) {
  const { listings, total, page, totalPages } = await getListings(searchParams);
  const categoryLabel = searchParams.category ? CATEGORY_LABELS[searchParams.category] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-4">
        <SearchBar compact />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-1">
        {searchParams.search ? `"${searchParams.search}" bo'yicha natijalar` : categoryLabel || "Barcha e'lonlar"}
      </h1>
      <p className="text-gray-400 text-sm mb-4">{total} ta e'lon topildi</p>

      <FilterBar />

      {listings.length === 0 ? (
        <p className="text-gray-400 py-16 text-center">Hech qanday e'lon topilmadi. Filtrlarni o'zgartirib ko'ring.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
