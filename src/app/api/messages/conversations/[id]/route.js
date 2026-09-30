// app/api/messages/conversations/[id]/route.js - Bitta suhbatning xabarlarini
// olish (GET, o'qilmagan xabarlarni "o'qilgan" deb belgilaydi) va yangi xabar
// yuborish (POST)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getBlockState } from '@/lib/blocks';
import { notifyUser } from '@/lib/notify';
import { escapeHtml, siteUrl } from '@/lib/telegramBot';

export const dynamic = 'force-dynamic';

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
    const block = await getBlockState(user.id, otherUser.id);

    return NextResponse.json({
      conversation: { id: conversation.id, otherUser, listing: conversation.listing, ...block },
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

    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === 'string' ? body.content : '';
    if (!content.trim()) {
      return NextResponse.json({ message: "Xabar matni bo'sh bo'lishi mumkin emas" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ message: "Xabar juda uzun (2000 belgidan oshmasin)" }, { status: 400 });
    }

    const otherId = conversation.participantAId === user.id ? conversation.participantBId : conversation.participantAId;
    const block = await getBlockState(user.id, otherId);
    if (block.blockedByMe) {
      return NextResponse.json({ message: "Siz bu foydalanuvchini bloklagansiz. Yozish uchun blokdan chiqaring." }, { status: 403 });
    }
    if (block.blockedMe) {
      return NextResponse.json({ message: "Bu foydalanuvchi sizga xabar yuborishni cheklagan." }, { status: 403 });
    }

    // Xabarni saqlash va suhbatning "updatedAt"ini yangilash (ro'yxatda eng
    // yuqorida chiqishi uchun) - bitta tranzaksiyada
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: conversation.id, senderId: user.id, content: content.trim() },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      }),
    ]);

    // Qabul qiluvchiga Telegram orqali bildirishnoma - faqat shu suhbatdagi
    // birinchi o'qilmagan xabar uchun (har bir xabarda bezovta qilmaslik uchun).
    // U xabarlarni o'qigach, keyingi yangi xabar yana bildiriladi.
    try {
      const earlierUnread = await prisma.message.count({
        where: { conversationId: conversation.id, senderId: user.id, read: false, id: { not: message.id } },
      });
      if (earlierUnread === 0) {
        const receiver = await prisma.user.findUnique({ where: { id: otherId }, select: { id: true, telegramChatId: true } });
        const preview = message.content.length > 200 ? `${message.content.slice(0, 200)}…` : message.content;
        await notifyUser(
          receiver,
          `💬 <b>${escapeHtml(user.name)}</b> sizga yozdi` +
            (conversation.listing ? `\n📦 ${escapeHtml(conversation.listing.title)}` : '') +
            `\n\n«${escapeHtml(preview)}»`,
          { reply_markup: { inline_keyboard: [[{ text: '↩️ Javob berish', url: siteUrl(`/kabinet/xabarlar/${conversation.id}`) }]] } }
        );
      }
    } catch (err) {
      console.error('Chat bildirishnomasida xatolik:', err.message);
    }

    return NextResponse.json({ message: message }, { status: 201 });
  } catch (err) {
    console.error('Xabar yuborishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
