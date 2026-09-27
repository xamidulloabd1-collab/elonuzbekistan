// lib/userLookup.js - Telefon raqam bo'yicha foydalanuvchini topish
// (eski foydalanuvchilar turli formatlarda saqlangan bo'lishi mumkin)
import { prisma } from './prisma';
import { toUzPhone, phoneVariants } from './phone';

export async function findUserByPhone(rawPhone, select) {
  const canonical = toUzPhone(rawPhone);
  const raw = String(rawPhone || '').replace(/[^\d+]/g, '');
  const candidates = [...new Set([...phoneVariants(canonical), raw].filter(Boolean))];
  if (!candidates.length) return null;
  return prisma.user.findFirst({ where: { phone: { in: candidates } }, ...(select ? { select } : {}) });
}
