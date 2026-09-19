// app/api/admin/pending-requests/route.js - Tasdiq kutayotgan arizalar (faqat admin)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Tizimga kirish talab qilinadi" }, { status: 401 });
    }
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Ruxsat yo'q: bu amal faqat adminlar uchun" }, { status: 403 });
    }

    const requests = await prisma.user.findMany({
      where: { subscriptionStatus: 'PENDING' },
      select: { id: true, name: true, phone: true, subscriptionPlan: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("Pending arizalarni olishda xatolik:", err);
    return NextResponse.json({ message: "Arizalarni yuklab bo'lmadi" }, { status: 500 });
  }
}
