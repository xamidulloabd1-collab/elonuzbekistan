// app/api/listings/[id]/phone/route.js - "Raqamni ko'rsatish" tugmasi
// Telefon raqami sahifa kodida bo'lmaydi - faqat shu so'rov orqali beriladi
// (botlar raqamlarni ommaviy yig'a olmaydi) va har bir ochilish hisoblanadi.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordPhoneReveal } from '@/lib/listingStats';

const BOT_RE = /bot|crawl|spider|slurp|headless|curl|wget|python|axios|scrapy/i;

export async function POST(request, { params }) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || BOT_RE.test(ua)) return NextResponse.json({ message: "Ruxsat yo'q" }, { status: 403 });

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { id: true, contactPhone: true, status: true, ownerId: true },
    });
    if (!listing || listing.status !== 'ACTIVE') {
      return NextResponse.json({ message: "E'lon topilmadi yoki faol emas" }, { status: 404 });
    }

    // Egasining o'z ko'rishi statistikaga qo'shilmaydi
    const user = await getCurrentUser();
    if (user?.id !== listing.ownerId) await recordPhoneReveal(listing.id);

    return NextResponse.json({ phone: listing.contactPhone });
  } catch (err) {
    console.error('Raqamni olishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
