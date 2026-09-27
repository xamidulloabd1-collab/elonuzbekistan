// app/api/messages/start/route.js - Ikki foydalanuvchi orasida suhbat
// boshlash (agar allaqachon bor bo'lsa, o'shani qaytaradi)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Xabar yozish uchun tizimga kiring' }, { status: 401 });
    }

    const { receiverId, listingId } = await request.json();

    if (!receiverId || receiverId === user.id) {
      return NextResponse.json({ message: "Noto'g'ri so'rov" }, { status: 400 });
    }

    // Takrorlanmaslik uchun ID'larni doim kichikdan kattaga tartiblab saqlaymiz
    const [participantAId, participantBId] = [user.id, receiverId].sort();

    let conversation = await prisma.conversation.findUnique({
      where: {
        participantAId_participantBId_listingId: {
          participantAId,
          participantBId,
          listingId: listingId || null,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { participantAId, participantBId, listingId: listingId || null },
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (err) {
    console.error('Suhbat boshlashda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
