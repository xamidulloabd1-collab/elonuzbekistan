// app/api/auth/reset-password/route.js - SMS kod orqali parolni tiklash
// body: { phone, code, newPassword }
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toUzPhone } from '@/lib/phone';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { PHONE_ERROR, MIN_PASSWORD } from '@/lib/validators';
import { findUserByPhone } from '@/lib/userLookup';
import { verifyAndConsumeOtp } from '@/lib/otp';
import { linkTelegramChat } from '@/lib/notify';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = toUzPhone(body.phone);
    const newPassword = String(body.newPassword || '');

    const errors = {};
    if (!phone) errors.phone = PHONE_ERROR;
    if (newPassword.length < MIN_PASSWORD) errors.newPassword = `Parol kamida ${MIN_PASSWORD} belgidan iborat bo'lishi kerak`;
    if (Object.keys(errors).length) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    const user = await findUserByPhone(phone, { id: true });
    if (!user) {
      return NextResponse.json({ message: 'Bu raqam bilan foydalanuvchi topilmadi' }, { status: 404 });
    }

    const otp = await verifyAndConsumeOtp({ phone, purpose: 'RESET_PASSWORD', code: body.code });
    if (!otp.ok) {
      return NextResponse.json({ message: otp.message, errors: { code: otp.message } }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      // Kod shu raqamga kelgani - raqam egasi ekanini ham tasdiqlaydi
      data: { passwordHash: await hashPassword(newPassword), phoneVerified: true },
      select: { id: true, name: true, phone: true, role: true },
    });

    // Kod bot orqali olingan bo'lsa - Telegram bildirishnomalarini darhol ulaymiz
    if (otp.telegramChatId) await linkTelegramChat(updated.id, otp.telegramChatId).catch(() => {});

    // Parol tiklangach, darhol tizimga kiritib qo'yamiz
    setAuthCookie(signToken(updated));

    return NextResponse.json({ message: 'Parol yangilandi', user: updated });
  } catch (err) {
    console.error('Parolni tiklashda xatolik:', err);
    return NextResponse.json({ message: 'Server xatoligi yuz berdi' }, { status: 500 });
  }
}
