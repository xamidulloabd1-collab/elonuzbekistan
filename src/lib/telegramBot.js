import crypto from 'crypto';
// lib/telegramBot.js - @elonuzz_bot orqali raqamni tasdiqlash (bepul zaxira kanal)
//
// Telegram Gateway budjeti tugaganda yoki kod yuborib bo'lmaganda, foydalanuvchiga
// bot havolasi beriladi. Botda "📱 Raqamni ulashish" tugmasi bosilganda Telegram
// raqamni o'zi tasdiqlab beradi (soxta raqam yuborib bo'lmaydi) va bot tasdiqlash
// kodini chatga yuboradi. Kod saytdagi odatiy maydonga kiritiladi.
//
// Kerakli .env qiymatlari:
//   TELEGRAM_BOT_TOKEN              - @BotFather'dan (allaqachon bor)
//   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME - "@elonuzz_bot" (allaqachon bor)
//   TELEGRAM_WEBHOOK_SECRET         - istalgan uzun tasodifiy matn (webhook himoyasi)

export function isBotConfigured() {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_WEBHOOK_SECRET &&
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
  );
}

export function getBotVerifyUrl() {
  const username = String(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
  return `https://t.me/${username}?start=kod`;
}

export async function botApi(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!data.ok) throw new Error(`Telegram Bot API (${method}) xatosi: ${data.description || res.status}`);
  return data.result;
}

export function escapeHtml(text) {
  return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function siteUrl(path = '') {
  return `${String(process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '')}${path}`;
}

// --- Kabinetdan "Telegram'ni ulash" havolasi ---------------------------------
// Havola: t.me/<bot>?start=link_<userId>_<imzo>. Imzo soxtalashtirishdan himoya
// qiladi: boshqa odamning ID'sini qo'yib, uning bildirishnomalarini o'ziga ulay olmaydi.
function linkSignature(userId) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || process.env.JWT_SECRET || 'elonuz_link';
  return crypto.createHmac('sha256', secret).update(`link:${userId}`).digest('hex').slice(0, 16);
}

export function getTelegramLinkUrl(userId) {
  const username = String(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
  return `https://t.me/${username}?start=link_${userId}_${linkSignature(userId)}`;
}

/** "link_<userId>_<imzo>" -> userId yoki null */
export function parseLinkPayload(payload) {
  const m = /^link_([a-z0-9]+)_([a-f0-9]{16})$/.exec(String(payload || ''));
  if (!m) return null;
  const expected = linkSignature(m[1]);
  return crypto.timingSafeEqual(Buffer.from(m[2]), Buffer.from(expected)) ? m[1] : null;
}

export const CONTACT_KEYBOARD = {
  keyboard: [[{ text: '📱 Raqamni ulashish', request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};
