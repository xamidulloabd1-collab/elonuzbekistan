// app/api/admin/approve-subscription/[userId]/route.js - Obunani tasdiqlash (faqat admin)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { VIP_QUOTA } from '@/lib/subscription';

export async function POST(request, { params }) {
  try {
    const admin = await getCurrentUser();
    if (!admin) {
      return NextResponse.json({ message: "Tizimga kirish talab qilinadi" }, { status: 401 });
    }
    if (!isAdmin(admin)) {
      return NextResponse.json({ message: "Ruxsat yo'q: bu amal faqat adminlar uchun" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!target) {
      return NextResponse.json({ message: "Foydalanuvchi topilmadi" }, { status: 404 });
    }
    if (target.subscriptionStatus !== 'PENDING') {
      return NextResponse.json(
        { message: `Bu foydalanuvchining arizasi "pending" holatida emas (joriy holat: ${target.subscriptionStatus})` },
        { status: 400 }
      );
    }

    // --- Muddatni hisoblash: hozirgi kundan aniq 30 kun keyin ---
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const plan = target.subscriptionPlan;
    const quota = VIP_QUOTA[plan]; // null = cheklovsiz (Biznes), 3 = Tadbirkor

    // Barchasini bitta tranzaksiyada bajaramiz - yoki hammasi muvaffaqiyatli
    // bo'ladi, yoki hech narsa o'zgarmaydi (yarim yangilanish bo'lmasligi uchun)
    const result = await prisma.$transaction(async (tx) => {
      let vipListingsUsed = 0;

      if (quota === null) {
        // "Biznes/Makler" - cheklovsiz: foydalanuvchining BARCHA e'lonlari VIP bo'ladi
        await tx.listing.updateMany({
          where: { ownerId: target.id },
          data: { isVip: true },
        });
      } else {
        // "Tadbirkor" - eng so'nggi `quota` tagacha e'lon VIP qilinadi,
        // qolganlari VIP bo'lmay qoladi (agar oldin VIP bo'lgan bo'lsa ham
        // qayta hisoblanadi - shu bilan har doim aniq bir xil qoidaga amal qilinadi)
        const recentListings = await tx.listing.findMany({
          where: { ownerId: target.id },
          orderBy: { createdAt: 'desc' },
          take: quota,
          select: { id: true },
        });
        const vipIds = recentListings.map((l) => l.id);

        await tx.listing.updateMany({
          where: { ownerId: target.id, id: { in: vipIds } },
          data: { isVip: true },
        });
        await tx.listing.updateMany({
          where: { ownerId: target.id, id: { notIn: vipIds } },
          data: { isVip: false },
        });

        vipListingsUsed = vipIds.length;
      }

      return tx.user.update({
        where: { id: target.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: expiresAt,
          vipListingsUsed, // yangi 30 kunlik davr uchun kvota hisoblagichi qayta boshlanadi
        },
      });
    });

    return NextResponse.json({
      message: `${result.name}ning tarifi muvaffaqiyatli tasdiqlandi`,
      user: {
        id: result.id, name: result.name, phone: result.phone,
        subscriptionPlan: result.subscriptionPlan,
        subscriptionStatus: result.subscriptionStatus,
        subscriptionExpiresAt: result.subscriptionExpiresAt,
      },
    });
  } catch (err) {
    console.error("Obunani tasdiqlashda xatolik:", err);
    return NextResponse.json({ message: "Obunani tasdiqlab bo'lmadi" }, { status: 500 });
  }
}
