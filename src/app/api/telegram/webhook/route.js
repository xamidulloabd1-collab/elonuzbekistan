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
import { prisma } from '@/lib/prisma';
import { botApi, CONTACT_KEYBOARD, parseLinkPayload, escapeHtml, siteUrl } from '@/lib/telegramBot';
import { linkTelegramChat } from '@/lib/notify';
import { markSold, renewListing } from '@/lib/listingLifecycle';

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

  // Raqam egasi ekanini Telegram tasdiqladi - bildirishnomalarni shu chatga ulaymiz
  if (existing) await linkTelegramChat(existing.id, chatId).catch(() => {});

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

// /start link_<userId>_<imzo> - kabinetdagi "Telegram'ni ulash" tugmasidan
async function handleLink(msg, payload) {
  const userId = parseLinkPayload(payload);
  const user = userId && (await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true } }));
  if (!user) {
    await send(msg.chat.id, "❗️ Havola eskirgan yoki noto'g'ri. Kabinetdan qaytadan urinib ko'ring.");
    return;
  }
  await linkTelegramChat(user.id, msg.chat.id);
  await send(
    msg.chat.id,
    `✅ <b>Tayyor, ${escapeHtml(user.name)}!</b>\n\n` +
      "Endi sizga shu yerda xabar beraman:\n" +
      "💬 kimdir sizga saytda yozganda\n" +
      "⏳ e'loningiz muddati tugashidan oldin\n\n" +
      "O'chirish uchun /stop yozing.",
    { reply_markup: { remove_keyboard: true } }
  );
}

async function handleStop(msg) {
  await prisma.user.updateMany({ where: { telegramChatId: String(msg.chat.id) }, data: { telegramChatId: null } });
  await send(msg.chat.id, "🔕 Bildirishnomalar o'chirildi. Qayta yoqish uchun kabinetdagi \"Telegram'ni ulash\" tugmasini bosing.");
}

// Eslatmadagi "Yana 30 kun" / "Sotildi" tugmalari
async function handleCallback(cb) {
  const [action, listingId] = String(cb.data || '').split(':');
  const answer = (text) => botApi('answerCallbackQuery', { callback_query_id: cb.id, text }).catch(() => {});

  const listing = listingId
    ? await prisma.listing.findUnique({ where: { id: listingId }, include: { owner: { select: { telegramChatId: true } } } })
    : null;
  // Faqat e'lon egasining (Telegram'i ulangan) chatidan bosilgan tugma qabul qilinadi
  if (!listing || listing.owner.telegramChatId !== String(cb.from.id)) {
    await answer("E'lon topilmadi");
    return;
  }

  let resultText;
  try {
    if (action === 'renew') {
      await renewListing(listing);
      resultText = `🔄 <b>Uzaytirildi!</b> E'lon yana 30 kun saytda turadi.\n\n📦 ${escapeHtml(listing.title)}`;
    } else if (action === 'sold') {
      await markSold(listing);
      resultText = `✅ <b>Tabriklaymiz!</b> E'lon "Sotildi" deb belgilandi.\n\n📦 ${escapeHtml(listing.title)}`;
    } else {
      await answer('Noma\'lum amal');
      return;
    }
  } catch (err) {
    await answer(err.message || 'Xatolik');
    return;
  }

  await answer('Bajarildi ✅');
  if (cb.message) {
    await botApi('editMessageText', {
      chat_id: cb.message.chat.id,
      message_id: cb.message.message_id,
      text: resultText,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '👤 Kabinetni ochish', url: siteUrl('/kabinet') }]] },
    }).catch(() => {});
  }
}

export async function POST(request) {
  if (!secretOk(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = await request.json();

    if (update.callback_query) {
      await handleCallback(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    const msg = update.message;
    if (!msg || msg.chat?.type !== 'private') return NextResponse.json({ ok: true });

    const text = String(msg.text || '').trim();
    const startPayload = text.startsWith('/start ') ? text.slice(7).trim() : '';

    if (msg.contact) {
      await handleContact(msg);
    } else if (startPayload.startsWith('link_')) {
      await handleLink(msg, startPayload);
    } else if (text === '/stop') {
      await handleStop(msg);
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
