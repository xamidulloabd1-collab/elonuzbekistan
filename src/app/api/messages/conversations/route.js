// app/api/messages/conversations/route.js - Foydalanuvchining barcha
// suhbatlari ro'yxati (oxirgi xabar va o'qilmaganlar soni bilan)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
      orderBy: { updatedAt: 'desc' },
      include: {
        participantA: { select: { id: true, name: true } },
        participantB: { select: { id: true, name: true } },
        listing: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    // O'qilmagan xabarlarni bitta so'rov bilan sanaymiz (har suhbat uchun alohida emas)
    const unread = conversations.length
      ? await prisma.message.groupBy({
          by: ['conversationId'],
          where: {
            conversationId: { in: conversations.map((c) => c.id) },
            senderId: { not: user.id },
            read: false,
          },
          _count: { _all: true },
        })
      : [];
    const unreadMap = Object.fromEntries(unread.map((u) => [u.conversationId, u._count._all]));

    const result = conversations.map((c) => ({
      id: c.id,
      otherUser: c.participantAId === user.id ? c.participantB : c.participantA,
      listing: c.listing,
      lastMessage: c.messages[0] || null,
      unreadCount: unreadMap[c.id] || 0,
      updatedAt: c.updatedAt,
    }));

    return NextResponse.json({ conversations: result });
  } catch (err) {
    console.error('Suhbatlarni olishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
