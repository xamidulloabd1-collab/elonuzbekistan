// app/api/subscription/request/route.js - Tizimga kirgan foydalanuvchi tarifga ariza berishi
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';
import { PLAN_LABELS } from '@/lib/labels';

const ALLOWED_PLANS = ['TADBIRKOR', 'BIZNES'];

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Ariza berish uchun tizimga kiring" }, { status: 401 });
    }

    const body = await request.json();
    const plan = body.plan;

    if (!ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json({ message: "Noto'g'ri tarif tanlandi" }, { status: 400 });
    }

    const isActiveNow =
      user.subscriptionStatus === 'ACTIVE' &&
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();

    if (isActiveNow) {
      return NextResponse.json({ message: "Sizda allaqachon faol obuna mavjud" }, { status: 400 });
    }
    if (user.subscriptionStatus === 'PENDING') {
      return NextResponse.json({ message: "Sizning arizangiz allaqachon ko'rib chiqilmoqda" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: plan, subscriptionStatus: 'PENDING', subscriptionExpiresAt: null },
    });

    // Operatorga (Telegram botga) darhol xabar boradi - bu try/catch bilan
    // himoyalangan, shuning uchun Telegram ishlamasa ham ariza saqlanaveradi
    const message =
      `🆕 <b>Yangi tarif arizasi — ElonUz</b>\n\n` +
      `👤 Ism: ${user.name}\n` +
      `📞 Telefon: ${user.phone}\n` +
      `💼 Tanlangan tarif: ${PLAN_LABELS[plan]}\n\n` +
      `Admin panelda tasdiqlashdan oldin mijoz bilan bog'lanib, to'lovni qabul qiling.`;
    sendTelegramMessage(message).catch(() => {});

    return NextResponse.json({ message: "Arizangiz qabul qilindi, admin tasdig'ini kuting" });
  } catch (err) {
    console.error("Tarif so'rashda xatolik:", err);
    return NextResponse.json({ message: "Server xatoligi yuz berdi, qayta urinib ko'ring" }, { status: 500 });
  }
}
