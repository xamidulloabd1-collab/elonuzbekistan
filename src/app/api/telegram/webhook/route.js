// app/api/telegram/webhook/route.js - @elonuzz_bot uchun webhook
//
// Foydalanuvchi botda "📱 Raqamni ulashish" tugmasini bosadi -> Telegram
// raqamni tasdiqlangan holda yuboradi -> biz tasdiqlash kodini yaratib,
// shu chatga yozamiz. Kod saytdagi maydonga kiritiladi.
//
// Webhook'ni bir marta ulash kerak:  node scripts/set-telegram-webhook.js https://elonuz.com
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { toUzPhone, formatUzPhone } from '@/lib/phone';
import { findUserByPhone } from '@/lib/userLookup';
import { createAndSendOtp } from '@/lib/otp';
import { botApi, CONTACT_KEYBOARD } from '@/lib/telegramBot';

export const dynamic = 'force-dynamic';

function secretOk(request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const got = request.headers.get('x-telegram-bot-api-secret-token') || '';
  if (!expected || got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

const send = (chat_id, text, extra = {}) =>
  botApi('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });

async function handleContact(msg) {
  const chatId = msg.chat.id;

  // Faqat o'z raqamini tugma orqali ulashishga ruxsat (boshqa odamning kontaktini
  // yuborib bo'lmaydi - Telegram contact.user_id ni faqat egasiga qo'yadi)
  if (!msg.contact.user_id || msg.contact.user_id !== msg.from?.id) {
    await send(chatId, "❗️ Iltimos, faqat <b>o'z raqamingizni</b> pastdagi tugma orqali ulashing.", {
      reply_markup: CONTACT_KEYBOARD,
    });
    return;
  }

  const phone = toUzPhone(msg.contact.phone_number);
  if (!phone) {
    await send(chatId, "❗️ Hozircha faqat O'zbekiston (+998) raqamlari qo'llab-quvvatlanadi.", {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  // Maqsadni aniqlaymiz: raqam ro'yxatdan o'tgan bo'lsa - parolni tiklash,
  // aks holda - ro'yxatdan o'tish (boshqasi baribir mumkin emas)
  const existing = await findUserByPhone(phone, { id: true });
  const purpose = existing ? 'RESET_PASSWORD' : 'REGISTER';

  const result = await createAndSendOtp({
    phone,
    purpose,
    ip: `tg:${msg.from.id}`, // IP o'rniga Telegram ID bo'yicha cheklov
    deliver: async (code) => {
      await send(
        chatId,
        `🔐 <b>E'lonUz tasdiqlash kodi:</b>\n\n<code>${code}</code>\n\n` +
          `Raqam: ${formatUzPhone(phone)}\n` +
          `Kodni saytdagi maydonga kiriting. U 5 daqiqa amal qiladi.\n\n` +
          `⚠️ Kodni hech kimga bermang — E'lonUz xodimlari uni hech qachon so'ramaydi.`,
        { reply_markup: { remove_keyboard: true } }
      );
      return { channel: 'bot' };
    },
  });

  if (!result.ok) {
    await send(chatId, `⏳ ${result.message}`, { reply_markup: { remove_keyboard: true } });
  }
}

export async function POST(request) {
  if (!secretOk(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = await request.json();
    const msg = update.message;
    if (!msg || msg.chat?.type !== 'private') return NextResponse.json({ ok: true });

    if (msg.contact) {
      await handleContact(msg);
    } else {
      // /start va boshqa har qanday xabar - tugmani ko'rsatamiz
      await send(
        msg.chat.id,
        "👋 Assalomu alaykum! Bu <b>E'lonUz</b> boti.\n\n" +
          "Tasdiqlash kodini olish uchun pastdagi <b>📱 Raqamni ulashish</b> tugmasini bosing.\n\n" +
          "Muhim: saytda kiritgan raqamingiz shu Telegram akkauntingiz raqami bilan bir xil bo'lishi kerak.",
        { reply_markup: CONTACT_KEYBOARD }
      );
    }
  } catch (err) {
    console.error('Telegram webhook xatosi:', err);
  }

  // Telegram har doim 200 kutadi, aks holda xabarni qayta-qayta yuboraveradi
  return NextResponse.json({ ok: true });
}
