// app/api/profile/shop/route.js - Do'kon sahifasi ma'lumotlari (faqat faol Biznes tarifi)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { hasActivePlan } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

const FIELDS = { shopName: 60, shopAddress: 160, shopHours: 80, shopDescription: 600 };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
  const shop = await prisma.user.findUnique({
    where: { id: user.id },
    select: { shopName: true, shopLogo: true, shopAddress: true, shopHours: true, shopDescription: true },
  });
  return NextResponse.json({ allowed: hasActivePlan(user, 'BIZNES'), shop });
}

export async function PATCH(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    if (!hasActivePlan(user, 'BIZNES')) {
      return NextResponse.json({ message: "Do'kon sahifasi faqat Biznes/Makler tarifida mavjud" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const data = {};
    for (const [key, max] of Object.entries(FIELDS)) {
      const v = typeof body[key] === 'string' ? body[key].trim().slice(0, max) : '';
      data[key] = v || null;
    }
    // Logo faqat o'zimizning yuklash xizmatimizdan bo'lishi mumkin
    const logo = typeof body.shopLogo === 'string' ? body.shopLogo.trim() : '';
    data.shopLogo = /^\/api\/upload\/[\w\-./]+$/.test(logo) ? logo : null;

    await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json({ message: "Do'kon sahifasi saqlandi" });
  } catch (err) {
    console.error("Do'kon sahifasini saqlashda xatolik:", err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
