// app/api/admin/listings/route.js - Barcha e'lonlar ro'yxati (faqat admin) -
// moderatsiya (yashirish/o'chirish) uchun. Statusidan qat'iy nazar hammasini ko'rsatadi.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kirish talab qilinadi' }, { status: 401 });
    }
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Ruxsat yo'q: bu amal faqat adminlar uchun" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const where = search
      ? { title: { contains: search, mode: 'insensitive' } }
      : {};

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100, // eng so'nggi 100 ta - katta ro'yxat uchun keyinroq sahifalash qo'shish mumkin
      include: { owner: { select: { name: true, phone: true } } },
    });

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("Admin: e'lonlarni olishda xatolik:", err);
    return NextResponse.json({ message: "E'lonlarni yuklab bo'lmadi" }, { status: 500 });
  }
}
