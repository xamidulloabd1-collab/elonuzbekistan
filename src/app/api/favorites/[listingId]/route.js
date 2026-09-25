// app/api/favorites/[listingId]/route.js - Bitta e'lonni sevimlilarga
// qo'shish (POST) yoki olib tashlash (DELETE)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Sevimlilarga qo'shish uchun tizimga kiring" }, { status: 401 });
  }

  try {
    // upsert: agar allaqachon bor bo'lsa xato bermaydi, shunchaki hech narsa qilmaydi
    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: user.id, listingId: params.listingId } },
      create: { userId: user.id, listingId: params.listingId },
      update: {},
    });
    return NextResponse.json({ message: "Sevimlilarga qo'shildi" }, { status: 201 });
  } catch (err) {
    console.error('Sevimlilarga qo\'shishda xatolik:', err);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
  }

  try {
    await prisma.favorite.deleteMany({
      where: { userId: user.id, listingId: params.listingId },
    });
    return NextResponse.json({ message: "Sevimlilardan olib tashlandi" });
  } catch (err) {
    console.error('Sevimlilardan olib tashlashda xatolik:', err);
    return NextResponse.json({ message: "Xatolik yuz berdi" }, { status: 500 });
  }
}
