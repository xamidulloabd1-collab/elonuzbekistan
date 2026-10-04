// app/api/listings/map/route.js - Xarita uchun yengil ma'lumot: joylashuvi
// belgilangan faol e'lonlar (filtrlar: kategoriya, hudud, narx)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CATEGORIES, REGIONS } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const where = { status: 'ACTIVE', latitude: { not: null }, longitude: { not: null } };

    const category = sp.get('category');
    const region = sp.get('region');
    if (category && CATEGORIES.includes(category)) where.category = category;
    if (region && REGIONS.includes(region)) where.region = region;

    const minPrice = Number(sp.get('minPrice'));
    const maxPrice = Number(sp.get('maxPrice'));
    if (Number.isFinite(minPrice) && minPrice > 0) where.price = { ...(where.price || {}), gte: minPrice };
    if (Number.isFinite(maxPrice) && maxPrice > 0) where.price = { ...(where.price || {}), lte: maxPrice };

    const rows = await prisma.listing.findMany({
      where,
      orderBy: [{ isVip: 'desc' }, { createdAt: 'desc' }],
      take: 2000,
      select: {
        id: true, title: true, price: true, currency: true, latitude: true, longitude: true,
        images: true, isVip: true, category: true, region: true,
      },
    });

    const points = rows.map((r) => ({
      id: r.id,
      title: r.title,
      price: Number(r.price),
      currency: r.currency,
      lat: r.latitude,
      lng: r.longitude,
      image: r.images?.[0] || null,
      isVip: r.isVip,
      category: r.category,
      region: r.region,
    }));

    return NextResponse.json({ points });
  } catch (err) {
    console.error("Xarita e'lonlarini olishda xatolik:", err);
    return NextResponse.json({ points: [], message: "Yuklab bo'lmadi" }, { status: 500 });
  }
}
