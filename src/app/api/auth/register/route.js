// app/api/auth/register/route.js - Ro'yxatdan o'tish (SMS kod bilan tasdiqlangan)
// body: { name, phone, password, code, ref? }
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { validateRegister } from '@/lib/validators';
import { findUserByPhone } from '@/lib/userLookup';
import { verifyAndConsumeOtp } from '@/lib/otp';
import { linkTelegramChat } from '@/lib/notify';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { valid, errors, data } = validateRegister(body);

    if (!valid) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    // Telefon raqam band qilinganligini tekshirish (eski formatlar ham hisobga olinadi)
    const existing = await findUserByPhone(data.phone, { id: true });
    if (existing) {
      return NextResponse.json(
        { message: "Bu telefon raqam bilan foydalanuvchi allaqachon mavjud" },
        { status: 409 }
      );
    }

    // SMS kodni tekshirish - raqam haqiqatan shu odamniki ekanini isbotlaydi
    const otp = await verifyAndConsumeOtp({ phone: data.phone, purpose: 'REGISTER', code: body.code });
    if (!otp.ok) {
      return NextResponse.json({ message: otp.message, errors: { code: otp.message } }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);

    // Referal kodi orqali kim tomonidan taklif qilinganini tekshiramiz
    // (body.ref - masalan elonuz.com/royxatdan-otish?ref=XXXXX orqali keladi)
    let referrer = null;
    const ref = typeof body.ref === 'string' ? body.ref.trim() : '';
    if (ref && ref.length <= 64) {
      referrer = await prisma.user.findUnique({ where: { referralCode: ref }, select: { id: true } });
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          name: data.name,
          phone: data.phone,
          phoneVerified: true,
          passwordHash,
          referredById: referrer?.id,
          // Taklif qilingan foydalanuvchi ham darhol 1 ta bepul VIP kredit oladi
          bonusVipCredits: referrer ? 1 : 0,
        },
        select: { id: true, name: true, phone: true, role: true },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        return NextResponse.json({ message: "Bu telefon raqam bilan foydalanuvchi allaqachon mavjud" }, { status: 409 });
      }
      throw err;
    }

    // Taklif qilgan foydalanuvchiga ham 1 ta bepul VIP kredit beramiz.
    // Endi har bir yangi akkaunt haqiqiy (SMS tasdiqlangan) raqamga ega,
    // shuning uchun soxta akkauntlar orqali kredit "yig'ib" bo'lmaydi.
    if (referrer) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: { bonusVipCredits: { increment: 1 } },
      }).catch((err) => console.error('Referal bonusini berishda xatolik:', err));
    }

    // Kod bot orqali olingan bo'lsa - Telegram bildirishnomalarini darhol ulaymiz
    if (otp.telegramChatId) await linkTelegramChat(user.id, otp.telegramChatId).catch(() => {});

    const token = signToken(user);
    setAuthCookie(token);

    return NextResponse.json({ message: "Ro'yxatdan muvaffaqiyatli o'tdingiz", user }, { status: 201 });
  } catch (err) {
    console.error("Ro'yxatdan o'tishda xatolik:", err);
    return NextResponse.json({ message: "Server xatoligi yuz berdi, qayta urinib ko'ring" }, { status: 500 });
  }
}
