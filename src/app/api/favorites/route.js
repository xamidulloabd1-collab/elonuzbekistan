// app/api/favorites/route.js - Joriy foydalanuvchining sevimli e'lonlari
// TO'LIQ ro'yxati (kabinetdagi "Sevimlilarim" sahifasi uchun)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { listing: true },
  });

  return NextResponse.json({ listings: favorites.map((f) => f.listing) });
}
