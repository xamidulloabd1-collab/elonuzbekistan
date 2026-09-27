// app/api/auth/otp/send/route.js - Tasdiqlash kodini yuborish (Telegram yoki SMS)
// body: { phone, purpose: "REGISTER" | "RESET_PASSWORD" }
import { NextResponse } from 'next/server';
import { toUzPhone } from '@/lib/phone';
import { PHONE_ERROR } from '@/lib/validators';
import { findUserByPhone } from '@/lib/userLookup';
import { createAndSendOtp, getClientIp } from '@/lib/otp';

const PURPOSES = ['REGISTER', 'RESET_PASSWORD'];

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const phone = toUzPhone(body.phone);
    const purpose = body.purpose;

    if (!PURPOSES.includes(purpose)) {
      return NextResponse.json({ message: "Noto'g'ri so'rov" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: PHONE_ERROR, errors: { phone: PHONE_ERROR } }, { status: 400 });
    }

    const existing = await findUserByPhone(phone, { id: true });

    if (purpose === 'REGISTER' && existing) {
      const msg = "Bu raqam allaqachon ro'yxatdan o'tgan. Tizimga kiring yoki parolni tiklang";
      return NextResponse.json({ message: msg, errors: { phone: msg } }, { status: 409 });
    }
    if (purpose === 'RESET_PASSWORD' && !existing) {
      const msg = 'Bu raqam bilan foydalanuvchi topilmadi';
      return NextResponse.json({ message: msg, errors: { phone: msg } }, { status: 404 });
    }

    const result = await createAndSendOtp({ phone, purpose, ip: getClientIp(request) });
    if (!result.ok) {
      return NextResponse.json({ message: result.message, resendIn: result.resendIn }, { status: result.status });
    }

    return NextResponse.json({
      message: 'Kod yuborildi',
      resendIn: result.resendIn,
      channel: result.channel, // 'telegram' | 'sms' | 'bot' | 'dev'
      ...(result.botUrl ? { botUrl: result.botUrl } : {}),
      ...(result.devCode ? { devCode: result.devCode } : {}),
    });
  } catch (err) {
    console.error('OTP yuborishda xatolik:', err);
    return NextResponse.json({ message: 'Server xatoligi yuz berdi' }, { status: 500 });
  }
}
