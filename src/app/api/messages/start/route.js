// app/api/messages/start/route.js - Ikki foydalanuvchi orasida suhbat
// boshlash (agar allaqachon bor bo'lsa, o'shani qaytaradi)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isBlockedEitherWay } from '@/lib/blocks';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Xabar yozish uchun tizimga kiring' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const receiverId = typeof body.receiverId === 'string' ? body.receiverId : null;
    const listingId = typeof body.listingId === 'string' && body.listingId ? body.listingId : null;

    if (!receiverId || receiverId === user.id) {
      return NextResponse.json({ message: "Noto'g'ri so'rov" }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });
    if (!receiver) {
      return NextResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    if (await isBlockedEitherWay(user.id, receiverId)) {
      return NextResponse.json({ message: "Bu foydalanuvchi bilan yozishib bo'lmaydi (bloklangan)" }, { status: 403 });
    }

    // E'lon ko'rsatilgan bo'lsa, u haqiqatan shu foydalanuvchiga tegishli bo'lishi kerak
    if (listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } });
      if (!listing || listing.ownerId !== receiverId) {
        return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
      }
    }

    // Takrorlanmaslik uchun ID'larni doim kichikdan kattaga tartiblab saqlaymiz
    const [participantAId, participantBId] = [user.id, receiverId].sort();

    // Eslatma: listingId null bo'lishi mumkin, Prisma esa null qiymatli
    // compound unique bo'yicha findUnique qila olmaydi - shuning uchun findFirst.
    let conversation = await prisma.conversation.findFirst({
      where: { participantAId, participantBId, listingId },
      select: { id: true },
    });

    if (!conversation) {
      try {
        conversation = await prisma.conversation.create({
          data: { participantAId, participantBId, listingId },
          select: { id: true },
        });
      } catch (err) {
        // Bir vaqtda ikki marta bosilsa - unique xatosi (P2002), mavjudini qaytaramiz
        if (err.code !== 'P2002') throw err;
        conversation = await prisma.conversation.findFirst({
          where: { participantAId, participantBId, listingId },
          select: { id: true },
        });
      }
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (err) {
    console.error('Suhbat boshlashda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
