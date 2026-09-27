// app/api/messages/unread-count/route.js - Navbar'dagi 💬 belgisi uchun
// joriy foydalanuvchining jami o'qilmagan xabarlari soni
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ count: 0 });

    const count = await prisma.message.count({
      where: {
        read: false,
        senderId: { not: user.id },
        conversation: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
      },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error("O'qilmagan xabarlarni sanashda xatolik:", err);
    return NextResponse.json({ count: 0 });
  }
}
