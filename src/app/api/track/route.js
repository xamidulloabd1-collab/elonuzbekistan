// app/api/track/route.js - Sahifa ko'rishlarini hisoblash (statistika uchun)
//
// Maxfiylik: IP manzil ham, brauzer ma'lumoti ham saqlanmaydi. Ulardan har kuni
// almashadigan anonim xesh olinadi - bir kishini kunlar bo'yicha kuzatib bo'lmaydi.
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getClientIp } from '@/lib/otp';
import { tashkentDay, dayToDate } from '@/lib/stats';

const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|axios/i;

export async function POST(request) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_RE.test(ua)) return new NextResponse(null, { status: 204 });

    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path : '';
    if (path.startsWith('/admin')) return new NextResponse(null, { status: 204 });

    const day = tashkentDay();
    const secret = process.env.JWT_SECRET || 'elonuz_stats';
    const visitorHash = crypto
      .createHmac('sha256', secret)
      .update(`${getClientIp(request) || '-'}|${ua}|${day}`)
      .digest('hex')
      .slice(0, 32);

    await prisma.siteVisit.upsert({
      where: { day_visitorHash: { day: dayToDate(day), visitorHash } },
      create: { day: dayToDate(day), visitorHash },
      update: { views: { increment: 1 } },
    });

    // 13 oydan eski yozuvlarni vaqti-vaqti bilan tozalaymiz
    if (Math.random() < 0.002) {
      prisma.siteVisit
        .deleteMany({ where: { day: { lt: dayToDate(tashkentDay(400)) } } })
        .catch(() => {});
    }
  } catch (err) {
    console.error('Tashrifni hisoblashda xatolik:', err.message);
  }
  return new NextResponse(null, { status: 204 });
}
