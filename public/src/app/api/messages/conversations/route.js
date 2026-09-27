// app/api/messages/conversations/route.js - Foydalanuvchining barcha
// suhbatlari ro'yxati (oxirgi xabar bilan)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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

    const result = await Promise.all(
      conversations.map(async (c) => {
        const otherUser = c.participantAId === user.id ? c.participantB : c.participantA;
        const unreadCount = await prisma.message.count({
          where: { conversationId: c.id, senderId: { not: user.id }, read: false },
        });
        return {
          id: c.id,
          otherUser,
          listing: c.listing,
          lastMessage: c.messages[0] || null,
          unreadCount,
          updatedAt: c.updatedAt,
        };
      })
    );

    return NextResponse.json({ conversations: result });
  } catch (err) {
    console.error('Suhbatlarni olishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
