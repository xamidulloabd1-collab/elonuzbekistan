// app/api/reports/route.js - Shikoyat yuborish (e'lon yoki foydalanuvchi ustidan)
// body: { listingId?, reportedUserId?, reason, details? }
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';
import { escapeHtml, siteUrl } from '@/lib/telegramBot';
import { REPORT_REASON_LABELS } from '@/lib/labels';

const MAX_PER_DAY = 10;

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Shikoyat qilish uchun tizimga kiring' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const reason = body.reason;
    const details = typeof body.details === 'string' ? body.details.trim().slice(0, 1000) : '';
    let listingId = typeof body.listingId === 'string' && body.listingId ? body.listingId : null;
    let reportedUserId = typeof body.reportedUserId === 'string' && body.reportedUserId ? body.reportedUserId : null;

    if (!REPORT_REASON_LABELS[reason]) {
      return NextResponse.json({ message: 'Shikoyat sababini tanlang' }, { status: 400 });
    }
    if (!listingId && !reportedUserId) {
      return NextResponse.json({ message: "Noto'g'ri so'rov" }, { status: 400 });
    }

    let listing = null;
    if (listingId) {
      listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, title: true, ownerId: true } });
      if (!listing) return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
      reportedUserId = reportedUserId || listing.ownerId;
    }
    if (reportedUserId === user.id) {
      return NextResponse.json({ message: "O'zingiz ustingizdan shikoyat qila olmaysiz" }, { status: 400 });
    }
    const reported = reportedUserId
      ? await prisma.user.findUnique({ where: { id: reportedUserId }, select: { id: true, name: true } })
      : null;
    if (reportedUserId && !reported) return NextResponse.json({ message: 'Foydalanuvchi topilmadi' }, { status: 404 });

    const dayAgo = new Date(Date.now() - 86400000);
    const todayCount = await prisma.report.count({ where: { reporterId: user.id, createdAt: { gte: dayAgo } } });
    if (todayCount >= MAX_PER_DAY) {
      return NextResponse.json({ message: "Bugun juda ko'p shikoyat yubordingiz. Ertaga urinib ko'ring" }, { status: 429 });
    }

    // Bir xil ochiq shikoyatni takror yubormaslik
    const duplicate = await prisma.report.findFirst({
      where: { reporterId: user.id, status: 'OPEN', listingId: listing?.id ?? null, reportedUserId },
      select: { id: true },
    });
    if (duplicate) return NextResponse.json({ message: "Shikoyatingiz allaqachon qabul qilingan, ko'rib chiqilmoqda" });

    await prisma.report.create({
      data: { reporterId: user.id, listingId: listing?.id ?? null, reportedUserId, reason, details: details || null },
    });

    await sendTelegramMessage(
      `🚩 <b>Yangi shikoyat — E'lonUz</b>\n\n` +
        `Sabab: ${escapeHtml(REPORT_REASON_LABELS[reason])}\n` +
        (listing ? `E'lon: ${escapeHtml(listing.title)}\n${siteUrl(`/elon/${listing.id}`)}\n` : '') +
        (reported ? `Foydalanuvchi: ${escapeHtml(reported.name)}\n` : '') +
        (details ? `Izoh: ${escapeHtml(details)}\n` : '') +
        `Kimdan: ${escapeHtml(user.name)}\n\nAdmin panel → 🚩 Shikoyatlar`
    ).catch(() => {});

    return NextResponse.json({ message: "Rahmat! Shikoyatingiz qabul qilindi va 24 soat ichida ko'rib chiqiladi" }, { status: 201 });
  } catch (err) {
    console.error('Shikoyat yuborishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
