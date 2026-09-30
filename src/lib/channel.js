// lib/channel.js - Yangi e'lonlarni Telegram kanalga avtomatik joylash
//
// .env: TELEGRAM_CHANNEL_ID - kanal username'i ("@elonuz_kanal") yoki ID ("-100...").
// Bot kanalga ADMIN qilib qo'shilgan va "Post messages" huquqiga ega bo'lishi kerak.
// Sozlanmagan bo'lsa - hech narsa qilinmaydi (sayt odatdagidek ishlayveradi).
import { prisma } from './prisma';
import { botApi, escapeHtml, siteUrl } from './telegramBot';
import { CATEGORY_LABELS, REGION_LABELS, formatPrice } from './labels';

const isConfigured = () => Boolean(process.env.TELEGRAM_CHANNEL_ID && process.env.TELEGRAM_BOT_TOKEN);

function absoluteImage(url) {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = siteUrl();
  return base ? `${base}${url.startsWith('/') ? '' : '/'}${url}` : null;
}

function buildCaption(listing, statusLine = '') {
  const desc = String(listing.description || '').trim();
  const shortDesc = desc.length > 300 ? `${desc.slice(0, 300)}…` : desc;
  const head = statusLine ? `${statusLine}\n\n` : '';
  const title = statusLine ? `<s>${escapeHtml(listing.title)}</s>` : `<b>${escapeHtml(listing.title)}</b>`;
  return (
    `${head}${listing.isVip && !statusLine ? '⭐ ' : ''}${title}\n\n` +
    `💰 ${escapeHtml(formatPrice(listing.price, listing.currency))}\n` +
    `📍 ${escapeHtml(REGION_LABELS[listing.region] || listing.region)}\n` +
    `🏷 ${escapeHtml(CATEGORY_LABELS[listing.category] || listing.category)}` +
    (shortDesc && !statusLine ? `\n\n${escapeHtml(shortDesc)}` : '')
  );
}

const detailsButton = (listing) => ({
  inline_keyboard: [[{ text: "👉 Batafsil / Bog'lanish", url: siteUrl(`/elon/${listing.id}`) }]],
});

/** Yangi e'lonni kanalga joylaydi va post ID'sini saqlaydi */
export async function postListingToChannel(listing) {
  if (!isConfigured() || !siteUrl()) return;
  const chat_id = process.env.TELEGRAM_CHANNEL_ID;
  const caption = buildCaption(listing);
  const photo = absoluteImage(listing.images?.[0]);
  let sent = null;

  try {
    if (photo) {
      sent = await botApi('sendPhoto', { chat_id, photo, caption, parse_mode: 'HTML', reply_markup: detailsButton(listing) });
    }
  } catch (err) {
    console.error('Kanalga rasm bilan joylab bo\'lmadi, matn yuboriladi:', err.message);
  }

  try {
    if (!sent) {
      sent = await botApi('sendMessage', {
        chat_id,
        text: caption,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: detailsButton(listing),
      });
    }
    await prisma.listing.update({ where: { id: listing.id }, data: { channelMessageId: sent.message_id } });
  } catch (err) {
    console.error('Kanalga joylashda xatolik:', err.message);
  }
}

/**
 * Kanaldagi postni yangilaydi: "✅ SOTILDI", "⌛ Muddati tugagan" va h.k.
 * Rasmli post bo'lsa - izoh (caption), matnli bo'lsa - matn tahrirlanadi.
 */
export async function markChannelPost(listing, statusLine) {
  if (!isConfigured() || !listing?.channelMessageId) return;
  const base = {
    chat_id: process.env.TELEGRAM_CHANNEL_ID,
    message_id: listing.channelMessageId,
    parse_mode: 'HTML',
  };
  const text = buildCaption(listing, statusLine);
  try {
    await botApi('editMessageCaption', { ...base, caption: text });
  } catch {
    await botApi('editMessageText', { ...base, text, disable_web_page_preview: true }).catch((err) =>
      console.error('Kanal postini yangilab bo\'lmadi:', err.message)
    );
  }
}

/** E'lon o'chirilganda kanaldagi postni olib tashlaydi (bo'lmasa - belgilab qo'yadi) */
export async function removeChannelPost(listing) {
  if (!isConfigured() || !listing?.channelMessageId) return;
  try {
    await botApi('deleteMessage', { chat_id: process.env.TELEGRAM_CHANNEL_ID, message_id: listing.channelMessageId });
  } catch {
    await markChannelPost(listing, "❌ E'lon olib tashlangan");
  }
}
