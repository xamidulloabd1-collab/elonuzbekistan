// lib/listingLifecycle.js - E'lon muddati va "Sotildi" holati
//
// - Har bir e'lon 30 kun faol turadi (expiresAt)
// - Tugashidan 3 kun oldin egasiga (Telegram ulangan bo'lsa) eslatma boradi,
//   unda "Yana 30 kun" va "Sotildi" tugmalari bor
// - Muddati tugaganda e'lon EXPIRED bo'ladi (saytdan yashiriladi), egasi
//   kabinetdan bir bosishda qayta faollashtira oladi
import { prisma } from './prisma';
import { notifyUser } from './notify';
import { markChannelPost } from './channel';
import { escapeHtml, siteUrl } from './telegramBot';

export const LISTING_TTL_DAYS = 30;
export const REMIND_BEFORE_DAYS = 3;

export const newExpiry = () => new Date(Date.now() + LISTING_TTL_DAYS * 86400000);

/** Egasi e'lonni "Sotildi" deb belgilaydi */
export async function markSold(listing) {
  if (listing.status === 'SOLD') return listing;
  if (listing.status !== 'ACTIVE' && listing.status !== 'EXPIRED') {
    throw Object.assign(new Error("Bu e'lonni sotildi deb belgilab bo'lmaydi"), { status: 400 });
  }
  const updated = await prisma.listing.update({ where: { id: listing.id }, data: { status: 'SOLD' } });
  await markChannelPost(updated, '✅ SOTILDI');
  return updated;
}

/** Egasi e'lon muddatini yana 30 kunga uzaytiradi (muddati tugagan bo'lsa ham) */
export async function renewListing(listing) {
  if (listing.status !== 'ACTIVE' && listing.status !== 'EXPIRED') {
    throw Object.assign(new Error("Bu e'lonni uzaytirib bo'lmaydi"), { status: 400 });
  }
  return prisma.listing.update({
    where: { id: listing.id },
    data: { status: 'ACTIVE', expiresAt: newExpiry(), reminderSentAt: null },
  });
}

export const reminderKeyboard = (listingId) => ({
  inline_keyboard: [
    [
      { text: '🔄 Yana 30 kun', callback_data: `renew:${listingId}` },
      { text: '✅ Sotildi', callback_data: `sold:${listingId}` },
    ],
  ],
});

/** Muddati yaqinlashgan e'lonlar egalariga eslatma (cron har soatda chaqiradi) */
export async function sendExpiryReminders(limit = 50) {
  const now = new Date();
  const soon = new Date(now.getTime() + REMIND_BEFORE_DAYS * 86400000);
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE', reminderSentAt: null, expiresAt: { gt: now, lte: soon } },
    include: { owner: { select: { id: true, telegramChatId: true } } },
    take: limit,
  });

  let sent = 0;
  for (const l of listings) {
    const days = Math.max(1, Math.ceil((l.expiresAt - now) / 86400000));
    const ok = await notifyUser(
      l.owner,
      `⏳ <b>E'loningiz muddati ${days} kundan keyin tugaydi</b>\n\n` +
        `📦 ${escapeHtml(l.title)}\n\n` +
        `Hali sotilmagan bo'lsa — "Yana 30 kun" tugmasini bosing. Sotilgan bo'lsa — "Sotildi" ni bosing.`,
      { reply_markup: reminderKeyboard(l.id) }
    );
    if (ok) sent++;
    // Telegram ulanmagan bo'lsa ham belgilaymiz - har soatda qayta tekshirilmasin
    await prisma.listing.update({ where: { id: l.id }, data: { reminderSentAt: now } });
  }
  return { checked: listings.length, sent };
}

/** Muddati tugagan e'lonlarni yashiradi va egalariga xabar beradi */
export async function expireDueListings(limit = 100) {
  const now = new Date();
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE', expiresAt: { lte: now } },
    include: { owner: { select: { id: true, telegramChatId: true } } },
    take: limit,
  });
  if (!listings.length) return { expired: 0 };

  await prisma.listing.updateMany({
    where: { id: { in: listings.map((l) => l.id) }, status: 'ACTIVE' },
    data: { status: 'EXPIRED' },
  });

  for (const l of listings) {
    await notifyUser(
      l.owner,
      `⌛ <b>E'loningiz muddati tugadi va saytdan yashirildi</b>\n\n📦 ${escapeHtml(l.title)}\n\n` +
        `Hali sotilmagan bo'lsa — qayta faollashtiring:`,
      { reply_markup: reminderKeyboard(l.id) }
    );
    await markChannelPost(l, "⌛ E'lon faol emas");
  }
  return { expired: listings.length };
}

export const cabinetUrl = () => siteUrl('/kabinet');
