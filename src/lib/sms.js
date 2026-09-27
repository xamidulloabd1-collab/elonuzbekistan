// lib/sms.js - Tasdiqlash kodini foydalanuvchiga yetkazish
//
// Kodni o'zimiz yaratamiz (lib/otp.js), bu fayl esa faqat YETKAZADI.
// Kanallar (birinchi sozlangani ishlatiladi):
//
//   1) Telegram Gateway - kod foydalanuvchining Telegram'iga keladi
//      .env: TELEGRAM_GATEWAY_TOKEN  (gateway.telegram.org -> API token)
//   2) Eskiz.uz SMS     - Telegram yetkaza olmasa (raqamda Telegram yo'q) zaxira sifatida
//      .env: ESKIZ_EMAIL, ESKIZ_PASSWORD, ESKIZ_FROM (ixtiyoriy), ESKIZ_SMS_TEMPLATE (ixtiyoriy)
//
// Hech biri sozlanmagan bo'lsa va sayt lokalda (development) ishlayotgan bo'lsa -
// kod faqat terminalga chiqariladi. Production'da esa xato beriladi.

const TG_API = 'https://gatewayapi.telegram.org';
const ESKIZ_API = 'https://notify.eskiz.uz/api';

const hasTelegram = () => Boolean(process.env.TELEGRAM_GATEWAY_TOKEN);
const hasEskiz = () => Boolean(process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD);

export function isSmsConfigured() {
  return hasTelegram() || hasEskiz();
}

export class DeliveryError extends Error {
  constructor(message, userMessage) {
    super(message);
    this.userMessage = userMessage;
  }
}

// ---------------------------------------------------------------- Telegram
async function sendViaTelegram(phone, code, ttlSeconds) {
  const res = await fetch(`${TG_API}/sendVerificationMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.TELEGRAM_GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone_number: `+${phone}`,
      code, // o'zimiz yaratgan kod - Telegram shuni yetkazadi
      ttl: ttlSeconds,
    }),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    const err = String(data.error || res.status);
    // Eng ko'p uchraydigan holat: bu raqamda Telegram akkaunt yo'q
    throw new DeliveryError(
      `Telegram Gateway xatosi: ${err}`,
      "Kodni Telegram orqali yuborib bo'lmadi. Shu raqamda Telegram ochilganiga ishonch hosil qiling"
    );
  }
  return data.result;
}

// ---------------------------------------------------------------- Eskiz
let eskizToken = null;

async function eskizLogin() {
  const form = new FormData();
  form.append('email', process.env.ESKIZ_EMAIL);
  form.append('password', process.env.ESKIZ_PASSWORD);
  const res = await fetch(`${ESKIZ_API}/auth/login`, { method: 'POST', body: form, cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.data?.token) throw new Error(`Eskiz login xatosi: ${res.status} ${data?.message || ''}`);
  eskizToken = data.data.token;
  return eskizToken;
}

async function eskizSendOnce(token, phone, text) {
  const form = new FormData();
  form.append('mobile_phone', phone);
  form.append('message', text);
  form.append('from', process.env.ESKIZ_FROM || '4546');
  return fetch(`${ESKIZ_API}/message/sms/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: 'no-store',
  });
}

async function sendViaEskiz(phone, code) {
  const text = (process.env.ESKIZ_SMS_TEMPLATE || 'ElonUz: tasdiqlash kodingiz {code}. Kodni hech kimga bermang.').replace(
    '{code}',
    code
  );
  let res = await eskizSendOnce(eskizToken || (await eskizLogin()), phone, text);
  if (res.status === 401) res = await eskizSendOnce(await eskizLogin(), phone, text);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Eskiz SMS xatosi: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

// ---------------------------------------------------------------- Umumiy
/**
 * phone - "998XXXXXXXXX", code - "123456"
 * Qaytaradi: { channel: 'telegram' | 'sms' | 'dev' }
 * Yetkaza olmasa DeliveryError (foydalanuvchiga ko'rsatiladigan userMessage bilan) tashlaydi.
 */
export async function deliverCode(phone, code, ttlSeconds = 300) {
  if (!isSmsConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[KOD - DEV REJIM, yuborilmadi] ${phone}: ${code}\n`);
      return { channel: 'dev' };
    }
    throw new DeliveryError('Kod yuborish xizmati sozlanmagan', "Kod yuborish vaqtincha ishlamayapti");
  }

  let telegramError = null;
  if (hasTelegram()) {
    try {
      await sendViaTelegram(phone, code, ttlSeconds);
      return { channel: 'telegram' };
    } catch (err) {
      telegramError = err;
      console.error(err.message);
    }
  }

  if (hasEskiz()) {
    await sendViaEskiz(phone, code); // xato bo'lsa - yuqoriga uzatiladi
    return { channel: 'sms' };
  }

  throw telegramError;
}
