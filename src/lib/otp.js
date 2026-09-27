// lib/otp.js - Tasdiqlash kodlari (OTP, Telegram yoki SMS orqali): yaratish, yuborish, tekshirish
//
// Xavfsizlik choralari:
// - kod bazada ochiq holda emas, HMAC-xesh ko'rinishida saqlanadi
// - kod 5 daqiqa amal qiladi, 5 marta noto'g'ri kiritilsa - bekor bo'ladi
// - bitta raqamga: 60 soniyada 1 ta, soatiga 5 tagacha SMS
// - bitta IP manzildan: soatiga 10 tagacha kod (balansni himoya qilish)

import crypto from 'crypto';
import { prisma } from './prisma';
import { deliverCode, isSmsConfigured } from './sms';

const CODE_TTL_MS = 5 * 60 * 1000;
const RESEND_AFTER_S = 60;
const MAX_PER_PHONE_HOUR = 5;
const MAX_PER_IP_HOUR = 10;
const MAX_ATTEMPTS = 5;

function hashCode(phone, code) {
  const secret = process.env.JWT_SECRET || 'elonuz_otp';
  return crypto.createHmac('sha256', secret).update(`${phone}:${code}`).digest('hex');
}

function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function getClientIp(request) {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  );
}

/**
 * Yangi kod yaratib SMS orqali yuboradi.
 * Qaytaradi: { ok: true, resendIn, devCode? } yoki { ok: false, status, message, resendIn? }
 */
export async function createAndSendOtp({ phone, purpose, ip }) {
  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000);

  const last = await prisma.phoneOtp.findFirst({
    where: { phone, purpose },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  if (last) {
    const passed = Math.floor((now - last.createdAt.getTime()) / 1000);
    if (passed < RESEND_AFTER_S) {
      const wait = RESEND_AFTER_S - passed;
      return { ok: false, status: 429, message: `Qayta yuborish uchun ${wait} soniya kuting`, resendIn: wait };
    }
  }

  const perPhone = await prisma.phoneOtp.count({ where: { phone, createdAt: { gte: hourAgo } } });
  if (perPhone >= MAX_PER_PHONE_HOUR) {
    return { ok: false, status: 429, message: "Bu raqamga juda ko'p kod so'raldi. 1 soatdan keyin urinib ko'ring" };
  }

  if (ip) {
    const perIp = await prisma.phoneOtp.count({ where: { ip, createdAt: { gte: hourAgo } } });
    if (perIp >= MAX_PER_IP_HOUR) {
      return { ok: false, status: 429, message: "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring" };
    }
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');

  const record = await prisma.phoneOtp.create({
    data: {
      phone,
      purpose,
      ip,
      codeHash: hashCode(phone, code),
      expiresAt: new Date(now + CODE_TTL_MS),
    },
  });

  let channel;
  try {
    ({ channel } = await deliverCode(phone, code, CODE_TTL_MS / 1000));
  } catch (err) {
    console.error('Kod yuborishda xatolik:', err.message);
    // Yuborilmagan kodni o'chirib tashlaymiz - "60 soniya kuting" cheklovi bo'lmasin
    await prisma.phoneOtp.delete({ where: { id: record.id } }).catch(() => {});
    return {
      ok: false,
      status: 502,
      message: err.userMessage || "Kod yuborib bo'lmadi. Birozdan keyin qayta urinib ko'ring",
    };
  }

  // Eski yozuvlarni vaqti-vaqti bilan tozalab turamiz (jadval o'sib ketmasin)
  if (Math.random() < 0.05) {
    prisma.phoneOtp
      .deleteMany({ where: { createdAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } } })
      .catch(() => {});
  }

  const result = { ok: true, resendIn: RESEND_AFTER_S, channel };
  // Lokal sinov uchun: Eskiz sozlanmagan bo'lsa, kodni javobda ham qaytaramiz
  if (!isSmsConfigured() && process.env.NODE_ENV !== 'production') result.devCode = code;
  return result;
}

/**
 * Kodni tekshiradi va to'g'ri bo'lsa "ishlatilgan" deb belgilaydi (qayta ishlatib bo'lmaydi).
 * Qaytaradi: { ok: true } yoki { ok: false, message }
 */
export async function verifyAndConsumeOtp({ phone, purpose, code }) {
  const clean = String(code || '').replace(/\D/g, '');
  if (clean.length !== 6) return { ok: false, message: 'SMS koddagi 6 ta raqamni kiriting' };

  const otp = await prisma.phoneOtp.findFirst({
    where: { phone, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) return { ok: false, message: 'Kod eskirgan yoki topilmadi. Yangi kod so\'rang' };
  if (otp.attempts >= MAX_ATTEMPTS) {
    return { ok: false, message: "Ko'p marta noto'g'ri kiritildi. Yangi kod so'rang" };
  }

  if (!safeEqual(otp.codeHash, hashCode(phone, clean))) {
    await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    const left = MAX_ATTEMPTS - otp.attempts - 1;
    return { ok: false, message: left > 0 ? `Kod noto'g'ri. Yana ${left} ta urinish qoldi` : "Kod noto'g'ri. Yangi kod so'rang" };
  }

  // Shartli yangilash: bir vaqtda ikki so'rov kelsa, faqat bittasi o'tadi
  const { count } = await prisma.phoneOtp.updateMany({
    where: { id: otp.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (count === 0) return { ok: false, message: "Kod allaqachon ishlatilgan. Yangi kod so'rang" };

  return { ok: true };
}
