// lib/phone.js - O'zbekiston telefon raqamlarini yagona ko'rinishga keltirish
//
// Barcha yangi foydalanuvchilar "998XXXXXXXXX" (12 raqam, + belgisiz)
// ko'rinishida saqlanadi - Eskiz ham aynan shu formatni kutadi.
// Eski foydalanuvchilar boshqa ko'rinishda (masalan "+998..." yoki
// "90...") saqlangan bo'lishi mumkin, shuning uchun qidirishda
// phoneVariants() barcha ehtimoliy ko'rinishlarni qaytaradi.

/**
 * "+998 90 123-45-67", "901234567", "998901234567" -> "998901234567"
 * Noto'g'ri raqam bo'lsa - null.
 */
export function toUzPhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 9) digits = '998' + digits;
  if (digits.length !== 12 || !digits.startsWith('998')) return null;
  return digits;
}

/** Bazada eski formatlarda saqlangan raqamlarni ham topish uchun */
export function phoneVariants(canonical) {
  if (!canonical) return [];
  return [canonical, '+' + canonical, canonical.slice(3)];
}

/** "998901234567" -> "+998 90 123 45 67" (foydalanuvchiga ko'rsatish uchun) */
export function formatUzPhone(canonical) {
  const p = toUzPhone(canonical);
  if (!p) return canonical;
  return `+998 ${p.slice(3, 5)} ${p.slice(5, 8)} ${p.slice(8, 10)} ${p.slice(10)}`;
}
