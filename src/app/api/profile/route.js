// app/api/profile/route.js - Profil ma'lumotlarini yangilash (ism, Telegram username)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
