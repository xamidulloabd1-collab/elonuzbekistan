// app/api/profile/password/route.js - Parolni o'zgartirish (joriy parol talab qilinadi)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    const errors = {};

    if (!currentPassword) errors.currentPassword = 'Joriy parolni kiriting';
    if (newPassword.length < 6) errors.newPassword = "Yangi parol kamida 6 belgidan iborat bo'lishi kerak";

    if (Object.keys(errors).length) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
    const ok = record && (await verifyPassword(currentPassword, record.passwordHash));
    if (!ok) {
      return NextResponse.json(
        { message: "Joriy parol noto'g'ri", errors: { currentPassword: "Joriy parol noto'g'ri" } },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ message: "Parol o'zgartirildi" });
  } catch (err) {
    console.error("Parolni o'zgartirishda xatolik:", err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
