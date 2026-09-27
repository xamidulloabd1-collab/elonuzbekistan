// app/api/messages/conversations/[id]/route.js - Bitta suhbatning xabarlarini
// olish (GET, o'qilmagan xabarlarni "o'qilgan" deb belgilaydi) va yangi xabar
// yuborish (POST)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function getConversationForUser(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participantA: { select: { id: true, name: true } },
      participantB: { select: { id: true, name: true } },
      listing: { select: { id: true, title: true } },
    },
  });

  if (!conversation) return null;
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) return null;

  return conversation;
}

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    }

    const conversation = await getConversationForUser(params.id, user.id);
    if (!conversation) {
      return NextResponse.json({ message: 'Suhbat topilmadi' }, { status: 404 });
    }

    // O'zimizga kelgan, hali o'qilmagan xabarlarni "o'qilgan" deb belgilaymiz
    await prisma.message.updateMany({
      where: { conversationId: conversation.id, senderId: { not: user.id }, read: false },
      data: { read: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    const otherUser = conversation.participantAId === user.id ? conversation.participantB : conversation.participantA;

    return NextResponse.json({
      conversation: { id: conversation.id, otherUser, listing: conversation.listing },
      messages,
    });
  } catch (err) {
    console.error('Suhbatni olishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    }

    const conversation = await getConversationForUser(params.id, user.id);
    if (!conversation) {
      return NextResponse.json({ message: 'Suhbat topilmadi' }, { status: 404 });
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ message: "Xabar matni bo'sh bo'lishi mumkin emas" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ message: "Xabar juda uzun (2000 belgidan oshmasin)" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { conversationId: conversation.id, senderId: user.id, content: content.trim() },
    });

    // Suhbatning "updatedAt"ini yangilaymiz - shunda ro'yxatda eng yuqorida chiqadi
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: message }, { status: 201 });
  } catch (err) {
    console.error('Xabar yuborishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
