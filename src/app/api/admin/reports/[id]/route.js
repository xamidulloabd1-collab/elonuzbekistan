// app/api/admin/reports/[id]/route.js - Shikoyatni ko'rib chiqish (faqat admin)
// { action: "resolve" }      - hal qilindi deb belgilash
// { action: "hide_listing" } - e'lonni yashirish + shu e'lon bo'yicha barcha shikoyatlarni yopish
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { removeChannelPost } from '@/lib/channel';

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kirish talab qilinadi' }, { status: 401 });
    if (!isAdmin(user)) return NextResponse.json({ message: "Ruxsat yo'q" }, { status: 403 });

    const report = await prisma.report.findUnique({ where: { id: params.id }, include: { listing: true } });
    if (!report) return NextResponse.json({ message: 'Shikoyat topilmadi' }, { status: 404 });

    const { action } = await request.json().catch(() => ({}));
    if (action === 'hide_listing') {
      if (!report.listing) return NextResponse.json({ message: "E'lon allaqachon o'chirilgan" }, { status: 400 });
      await prisma.listing.update({ where: { id: report.listing.id }, data: { status: 'ARCHIVED' } });
      await removeChannelPost(report.listing);
      await prisma.report.updateMany({ where: { listingId: report.listing.id, status: 'OPEN' }, data: { status: 'RESOLVED' } });
      return NextResponse.json({ message: "E'lon yashirildi, shikoyatlar yopildi" });
    }
    if (action === 'resolve') {
      await prisma.report.update({ where: { id: report.id }, data: { status: 'RESOLVED' } });
      return NextResponse.json({ message: 'Hal qilindi' });
    }
    return NextResponse.json({ message: "Noto'g'ri amal" }, { status: 400 });
  } catch (err) {
    console.error('Shikoyatni ko\'rib chiqishda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
