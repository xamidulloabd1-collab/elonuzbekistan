// app/api/blocks/route.js - Foydalanuvchini bloklash / blokdan chiqarish / ro'yxat
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
  const blocks = await prisma.userBlock.findMany({
    where: { blockerId: user.id },
    include: { blocked: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ blocks: blocks.map((b) => ({ user: b.blocked, createdAt: b.createdAt })) });
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    const { userId } = await request.json().catch(() => ({}));
    if (typeof userId !== 'string' || !userId || userId === user.id) {
      return NextResponse.json({ message: "Noto'g'ri so'rov" }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!exists) return NextResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });

    await prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: userId } },
      create: { blockerId: user.id, blockedId: userId },
      update: {},
    });
    return NextResponse.json({ message: 'Foydalanuvchi bloklandi' });
  } catch (err) {
    console.error('Bloklashda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    const userId = new URL(request.url).searchParams.get('userId');
    if (!userId) return NextResponse.json({ message: "Noto'g'ri so'rov" }, { status: 400 });
    await prisma.userBlock.deleteMany({ where: { blockerId: user.id, blockedId: userId } });
    return NextResponse.json({ message: 'Blokdan chiqarildi' });
  } catch (err) {
    console.error('Blokdan chiqarishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
