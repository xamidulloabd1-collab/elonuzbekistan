// app/api/profile/telegram/route.js - Telegram bildirishnomalari holati, ulash havolasi, uzish
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getTelegramLinkUrl } from '@/lib/telegramBot';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
  return NextResponse.json({ connected: Boolean(user.telegramChatId), linkUrl: getTelegramLinkUrl(user.id) });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
  await prisma.user.update({ where: { id: user.id }, data: { telegramChatId: null } });
  return NextResponse.json({ message: "Telegram bildirishnomalari o'chirildi" });
}
