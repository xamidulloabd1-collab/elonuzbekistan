// app/api/admin/listings/[id]/toggle-status/route.js - Adminning e'lonni
// yashirishi (ACTIVE -> ARCHIVED) yoki qayta ko'rsatishi (ARCHIVED -> ACTIVE)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { removeChannelPost } from '@/lib/channel';
import { newExpiry } from '@/lib/listingLifecycle';

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kirish talab qilinadi' }, { status: 401 });
    }
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Ruxsat yo'q: bu amal faqat adminlar uchun" }, { status: 403 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ message: "E'lon topilmadi" }, { status: 404 });
    }

    const newStatus = listing.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    const expired = !listing.expiresAt || listing.expiresAt <= new Date();
    const updated = await prisma.listing.update({
      where: { id: params.id },
      // Qayta ko'rsatilayotgan e'lonning muddati o'tgan bo'lsa - yangi 30 kun
      data: newStatus === 'ACTIVE' && expired ? { status: newStatus, expiresAt: newExpiry(), reminderSentAt: null } : { status: newStatus },
    });
    if (newStatus === 'ARCHIVED') await removeChannelPost(listing);

    return NextResponse.json({
      message: newStatus === 'ARCHIVED' ? "E'lon yashirildi" : "E'lon qayta ko'rsatildi",
      listing: updated,
    });
  } catch (err) {
    console.error("Admin: e'lon holatini o'zgartirishda xatolik:", err);
    return NextResponse.json({ message: "Amalni bajarib bo'lmadi" }, { status: 500 });
  }
}
