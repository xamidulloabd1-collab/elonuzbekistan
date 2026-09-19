// lib/subscription.js - Obuna (tarif) bilan bog'liq umumiy funksiyalar
import { prisma } from './prisma';

/**
 * Berilgan foydalanuvchi obyektida "active" deb belgilangan, lekin muddati
 * allaqachon o'tib ketgan obuna bo'lsa, holatini "expired"ga o'zgartiradi
 * (bazada ham, qaytarilgan obyektda ham). Aks holda o'zgarishsiz qaytaradi.
 *
 * getCurrentUser() ichida har safar chaqiriladi, shunda ilovaning istalgan
 * joyida "muddati tugagan" holat avtomatik yangilanib turadi.
 */
export async function checkAndExpireSubscription(user) {
  if (!user) return user;

  const isExpired =
    user.subscriptionStatus === 'ACTIVE' &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) < new Date();

  if (!isExpired) return user;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'EXPIRED' },
    });
    return { ...user, subscriptionStatus: 'EXPIRED' };
  } catch (err) {
    console.error('Obuna muddatini yangilashda xatolik:', err.message);
    return user; // xato bo'lsa ham, ilova ishlashda davom etsin
  }
}

/**
 * Foydalanuvchining hozir berilgan tarifda FAOL (muddati o'tmagan) obunasi
 * bor-yo'qligini tekshiradi.
 */
export function hasActivePlan(user, plan) {
  if (!user) return false;
  if (user.subscriptionStatus !== 'ACTIVE') return false;
  if (plan && user.subscriptionPlan !== plan) return false;
  if (!user.subscriptionExpiresAt) return false;
  return new Date(user.subscriptionExpiresAt) > new Date();
}

// Har bir tarifning oylik VIP e'lon kvotasi. `null` - cheklovsiz (Biznes/Makler).
export const VIP_QUOTA = {
  BIZNES: null,
  TADBIRKOR: 3,
};

/**
 * Foydalanuvchi hozir yangi e'lonni VIP qilib joylay oladimi-yo'qmi, shuni
 * aniqlaydi. Agar ha bo'lsa, kerak bo'lsa (Tadbirkor uchun) kvota
 * hisoblagichini +1 oshiradi va bazaga yozadi.
 *
 * Qaytaradi: true (VIP bo'ladi) yoki false (VIP bo'lmaydi).
 */
export async function tryConsumeVipSlot(user) {
  if (!hasActivePlan(user)) return false;

  const quota = VIP_QUOTA[user.subscriptionPlan];

  // Cheklovsiz tarif (Biznes/Makler) - har doim VIP
  if (quota === null || quota === undefined) return true;

  // Cheklangan tarif (Tadbirkor) - kvota tekshiriladi
  if (user.vipListingsUsed >= quota) return false;

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { vipListingsUsed: { increment: 1 } },
    });
    return true;
  } catch (err) {
    console.error('VIP kvotasini yangilashda xatolik:', err.message);
    return false; // xato bo'lsa, xavfsiz tomonga - VIP bermaymiz
  }
}
