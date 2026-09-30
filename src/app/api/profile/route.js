// app/api/profile/route.js - Profil ma'lumotlarini yangilash (ism, Telegram username)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyPassword, clearAuthCookie } from '@/lib/auth';
import { removeChannelPost } from '@/lib/channel';
import { phoneVariants, toUzPhone } from '@/lib/phone';

export async function PATCH(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const errors = {};

    const name = String(body.name || '').trim();
    if (name.length < 2 || name.length > 60) {
      errors.name = "Ism 2 dan 60 belgigacha bo'lishi kerak";
    }

    // "@username" yoki "username" ko'rinishida kelishi mumkin - @ belgisini olib tashlaymiz
    let telegramUsername = String(body.telegramUsername || '').trim().replace(/^@+/, '');
    if (telegramUsername && !/^[A-Za-z0-9_]{5,32}$/.test(telegramUsername)) {
      errors.telegramUsername = "Telegram username 5-32 ta lotin harfi, raqam yoki _ dan iborat bo'lishi kerak";
    }

    if (Object.keys(errors).length) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { name, telegramUsername: telegramUsername || null },
    });

    return NextResponse.json({ message: 'Profil yangilandi' });
  } catch (err) {
    console.error('Profilni yangilashda xatolik:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}

/**
 * DELETE /api/profile - Hisobni butunlay o'chirish (parol bilan tasdiqlanadi).
 * O'chiriladi: profil, barcha e'lonlar, sevimlilar, suhbatlar va xabarlar,
 * bloklar, yuborgan shikoyatlar, tasdiqlash kodlari. Kanal postlari olib tashlanadi.
 */
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });

    const { password } = await request.json().catch(() => ({}));
    const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true, phone: true } });
    if (!password || !record || !(await verifyPassword(String(password), record.passwordHash))) {
      return NextResponse.json({ message: "Parol noto'g'ri", errors: { password: "Parol noto'g'ri" } }, { status: 400 });
    }

    const listings = await prisma.listing.findMany({
      where: { ownerId: user.id, channelMessageId: { not: null } },
      select: { id: true, channelMessageId: true, title: true, price: true, currency: true, region: true, category: true, isVip: true, description: true },
    });
    await Promise.allSettled(listings.map((l) => removeChannelPost(l)));

    const variants = phoneVariants(toUzPhone(record.phone));
    await prisma.$transaction([
      prisma.phoneOtp.deleteMany({ where: { phone: { in: variants.length ? variants : [record.phone] } } }),
      prisma.user.delete({ where: { id: user.id } }), // qolganlari (e'lonlar, chat, ...) avtomatik o'chadi
    ]);

    clearAuthCookie();
    return NextResponse.json({ message: "Hisobingiz o'chirildi" });
  } catch (err) {
    console.error("Hisobni o'chirishda xatolik:", err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
