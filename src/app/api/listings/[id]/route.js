// app/api/listings/[id]/route.js - Bitta e'lon: ko'rish, tahrirlash, o'chirish
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateListing } from '@/lib/validators';

/**
 * GET /api/listings/:id - E'lon tafsilotlari (har safar ko'rilganda views +1)
 */
export async function GET(request, { params }) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { owner: { select: { name: true, phone: true, telegramUsername: true, createdAt: true } } },
    });

    if (!listing) {
      return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    }

    // Ko'rishlar sonini oshiramiz (natijani kutmasdan, sahifa tezroq ochilishi uchun)
    prisma.listing
      .update({ where: { id: params.id }, data: { views: { increment: 1 } } })
      .catch((err) => console.error("Views oshirishda xatolik:", err.message));

    return NextResponse.json({ listing: { ...listing, views: listing.views + 1 } });
  } catch (err) {
    console.error("E'lonni olishda xatolik:", err);
    return NextResponse.json({ message: "E'lonni yuklab bo'lmadi" }, { status: 500 });
  }
}

/**
 * PUT /api/listings/:id - E'lonni tahrirlash (faqat egasi)
 */
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Tizimga kirish talab qilinadi" }, { status: 401 });
    }

    const existing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    }
    if (existing.ownerId !== user.id) {
      return NextResponse.json({ message: "Bu e'lonni tahrirlash huquqingiz yo'q" }, { status: 403 });
    }

    const body = await request.json();
    const { valid, errors, data } = validateListing(body);

    if (!valid) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        region: data.region,
        price: data.price,
        currency: data.currency,
        contactPhone: data.contactPhone,
        images: data.images,
      },
    });

    return NextResponse.json({ message: "E'lon yangilandi", listing });
  } catch (err) {
    console.error("E'lonni tahrirlashda xatolik:", err);
    return NextResponse.json({ message: "E'lonni yangilab bo'lmadi" }, { status: 500 });
  }
}

/**
 * DELETE /api/listings/:id - E'lonni o'chirish (faqat egasi)
 */
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Tizimga kirish talab qilinadi" }, { status: 401 });
    }

    const existing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    }
    if (existing.ownerId !== user.id) {
      return NextResponse.json({ message: "Bu e'lonni o'chirish huquqingiz yo'q" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "E'lon o'chirildi" });
  } catch (err) {
    console.error("E'lonni o'chirishda xatolik:", err);
    return NextResponse.json({ message: "E'lonni o'chirib bo'lmadi" }, { status: 500 });
  }
}
