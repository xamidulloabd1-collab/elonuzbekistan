// app/api/listings/[id]/status/route.js - E'lon egasining amallari:
// { action: "sold" }  - "Sotildi" deb belgilash
// { action: "renew" } - muddatni yana 30 kunga uzaytirish (tugagan bo'lsa ham)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { markSold, renewListing } from '@/lib/listingLifecycle';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kirish talab qilinadi' }, { status: 401 });

    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    if (listing.ownerId !== user.id) {
      return NextResponse.json({ message: "Bu e'lon sizga tegishli emas" }, { status: 403 });
    }

    const { action } = await request.json().catch(() => ({}));
    let updated;
    if (action === 'sold') updated = await markSold(listing);
    else if (action === 'renew') updated = await renewListing(listing);
    else return NextResponse.json({ message: "Noto'g'ri amal" }, { status: 400 });

    return NextResponse.json({
      message: action === 'sold' ? "E'lon \"Sotildi\" deb belgilandi" : "E'lon yana 30 kunga uzaytirildi",
      listing: updated,
    });
  } catch (err) {
    if (err.status) return NextResponse.json({ message: err.message }, { status: err.status });
    console.error("E'lon holatini o'zgartirishda xatolik:", err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
