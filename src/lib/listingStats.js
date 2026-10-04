// lib/listingStats.js - E'lonning ko'rishlar va "Raqamni ko'rsatish" statistikasi
// (umumiy hisoblagich + kunlik jadval: egasi kabinetda "oxirgi 7 kun"ni ko'radi)
import { prisma } from './prisma';
import { tashkentDay, dayToDate } from './stats';

async function bumpDaily(listingId, field) {
  const day = dayToDate(tashkentDay());
  await prisma.listingDailyStat.upsert({
    where: { listingId_day: { listingId, day } },
    create: { listingId, day, [field]: 1 },
    update: { [field]: { increment: 1 } },
  });
}

/** Ko'rishni yozadi (natijani kutish shart emas - xato bo'lsa sahifa buzilmaydi) */
export function recordListingView(listingId) {
  return Promise.all([
    prisma.listing.update({ where: { id: listingId }, data: { views: { increment: 1 } } }),
    bumpDaily(listingId, 'views'),
  ]).catch((err) => console.error("Ko'rishni yozishda xatolik:", err.message));
}

export async function recordPhoneReveal(listingId) {
  await Promise.all([
    prisma.listing.update({ where: { id: listingId }, data: { phoneReveals: { increment: 1 } } }),
    bumpDaily(listingId, 'phoneReveals'),
  ]).catch((err) => console.error('Raqam statistikasida xatolik:', err.message));
}

/** Egasining e'lonlari bo'yicha oxirgi 7 kunlik statistika: { [listingId]: {...} } */
export async function getOwnerStats(ownerId) {
  const since = dayToDate(tashkentDay(6));
  const listings = await prisma.listing.findMany({ where: { ownerId }, select: { id: true, views: true, phoneReveals: true } });
  const ids = listings.map((l) => l.id);
  if (!ids.length) return {};

  const [daily, chats] = await Promise.all([
    prisma.listingDailyStat.groupBy({
      by: ['listingId'],
      where: { listingId: { in: ids }, day: { gte: since } },
      _sum: { views: true, phoneReveals: true },
    }),
    prisma.conversation.groupBy({ by: ['listingId'], where: { listingId: { in: ids } }, _count: { _all: true } }),
  ]);
  const d = Object.fromEntries(daily.map((x) => [x.listingId, x._sum]));
  const c = Object.fromEntries(chats.map((x) => [x.listingId, x._count._all]));

  return Object.fromEntries(
    listings.map((l) => [
      l.id,
      {
        views7: d[l.id]?.views || 0,
        phone7: d[l.id]?.phoneReveals || 0,
        viewsTotal: l.views,
        phoneTotal: l.phoneReveals,
        chats: c[l.id] || 0,
      },
    ])
  );
}
