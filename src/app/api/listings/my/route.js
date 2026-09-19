// app/api/listings/my/route.js - Foydalanuvchi kabineti uchun o'z e'lonlari
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Tizimga kirish talab qilinadi" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ listings });
  } catch (err) {
    console.error("Mening e'lonlarimni olishda xatolik:", err);
    return NextResponse.json({ message: "E'lonlaringizni yuklab bo'lmadi" }, { status: 500 });
  }
}
