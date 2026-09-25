// app/api/favorites/ids/route.js - Joriy foydalanuvchining sevimli e'lonlari
// ID'lari ro'yxati (faqat ID'lar - yengil, front-end holatini boshlash uchun)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ids: [] });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { listingId: true },
  });

  return NextResponse.json({ ids: favorites.map((f) => f.listingId) });
}
