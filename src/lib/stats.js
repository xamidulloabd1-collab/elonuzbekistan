// lib/stats.js - Statistika uchun yordamchi funksiyalar (Toshkent vaqti bo'yicha)

const TZ_OFFSET_MS = 5 * 60 * 60 * 1000; // Toshkent: UTC+5, yozgi vaqt yo'q

/** Toshkent vaqti bo'yicha bugungi sana "YYYY-MM-DD" (daysAgo kun oldin) */
export function tashkentDay(daysAgo = 0) {
  const t = new Date(Date.now() + TZ_OFFSET_MS - daysAgo * 86400000);
  return t.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" -> @db.Date ustuni uchun Date (UTC yarim tun) */
export function dayToDate(day) {
  return new Date(`${day}T00:00:00.000Z`);
}

/** Toshkent vaqti bo'yicha daysAgo kun oldingi yarim tun (createdAt bilan solishtirish uchun) */
export function tashkentMidnight(daysAgo = 0) {
  return new Date(dayToDate(tashkentDay(daysAgo)).getTime() - TZ_OFFSET_MS);
}

/** Toshkent vaqti bo'yicha monthsAgo oy oldingi oyning 1-kuni yarim tuni */
export function tashkentMonthStart(monthsAgo = 0) {
  const now = new Date(Date.now() + TZ_OFFSET_MS);
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  return new Date(d.getTime() - TZ_OFFSET_MS);
}

/** Oxirgi n oy uchun ["2026-04", ..., "2026-09"] */
export function lastMonths(n) {
  const now = new Date(Date.now() + TZ_OFFSET_MS);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (n - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

/** Oxirgi n kun uchun ["2026-09-01", ..., bugun] */
export function lastDays(n) {
  return Array.from({ length: n }, (_, i) => tashkentDay(n - 1 - i));
}
