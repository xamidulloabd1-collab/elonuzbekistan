// lib/prisma.js
// Prisma Client'ning yagona (singleton) nusxasini yaratadi.
//
// Next.js development rejimida har bir fayl o'zgarishida modul qayta
// yuklanadi (hot-reload) - agar bu yerda oddiy `new PrismaClient()`
// ishlatilsa, har safar yangi ulanish ochilib, oxir-oqibat PostgreSQL'ning
// "juda ko'p ulanish" xatosiga olib kelishi mumkin. Shuning uchun global
// obyektga saqlab, faqat bitta nusxadan foydalanamiz.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
