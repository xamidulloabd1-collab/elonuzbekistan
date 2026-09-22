// app/api/listings/route.js - E'lonlar ro'yxati (qidiruv/filtr bilan) va yangi e'lon qo'shish
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateListing } from '@/lib/validators';
import { tryConsumeVipSlot } from '@/lib/subscription';
import { sendTelegramMessage } from '@/lib/telegram';
import { CATEGORY_LABELS, REGION_LABELS, formatPrice } from '@/lib/labels';

/**
 * GET /api/listings?search=...&category=...&region=...&minPrice=...&maxPrice=...&page=1
 * Hech qanday autentifikatsiya talab qilinmaydi - hamma ko'ra oladi.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = 20;

    // Prisma "where" shartini bosqichma-bosqich yig'amiz
    const where = { status: 'ACTIVE' };

    if (search) {
      // Kalit so'z bo'yicha sarlavha yoki tavsifdan qidirish (katta-kichik harflarga sezgir emas)
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (region) where.region = region;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: [{ isVip: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { owner: { select: { name: true, phone: true } } },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error("E'lonlarni olishda xatolik:", err);
    return NextResponse.json({ message: "E'lonlarni yuklab bo'lmadi" }, { status: 500 });
  }
}

/**
 * POST /api/listings - Yangi e'lon qo'shish (tizimga kirish talab qilinadi)
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "E'lon qo'shish uchun tizimga kiring" }, { status: 401 });
    }

    const body = await request.json();
    const { valid, errors, data } = validateListing(body);

    if (!valid) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    // Foydalanuvchi (agar faol tarifi bo'lsa) e'lonni VIP qilib joylashni
    // xohlaydimi-yo'qmi, shuni frontend'dan keladigan "wantVip" orqali biladi.
    // Agar xohlamasa - hech qanday kvota sarflanmaydi (keyingi e'lon uchun saqlanib qoladi).
    // Agar xohlasa - tryConsumeVipSlot o'zi tarif turi va kvotani tekshiradi
    // (Biznes - cheklovsiz, Tadbirkor - oyiga 3 tagacha, tarifsiz - har doim false).
    const wantVip = Boolean(body.wantVip);
    const isVip = wantVip ? await tryConsumeVipSlot(user) : false;

    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        region: data.region,
        price: data.price,
        currency: data.currency,
        contactPhone: data.contactPhone,
        images: data.images,
        ownerId: user.id,
        isVip,
      },
    });

    // Operatorga (Telegram botga) yangi e'lon haqida darhol xabar boradi.
    // Xabar yuborilmasa ham (bot sozlanmagan yoki tarmoq xatosi bo'lsa),
    // e'lonning o'zi saqlanaveradi - shuning uchun natijani kutmaymiz va
    // xatoni faqat konsolga yozamiz (.catch orqali).
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const telegramMessage =
      `🆕 <b>Yangi e'lon — ElonUz</b>\n\n` +
      `📌 Sarlavha: ${data.title}\n` +
      `🏷️ Kategoriya: ${CATEGORY_LABELS[data.category]}\n` +
      `📍 Hudud: ${REGION_LABELS[data.region]}\n` +
      `💰 Narx: ${formatPrice(data.price, data.currency)}\n` +
      `👤 Egasi: ${user.name} (${user.phone})` +
      (siteUrl ? `\n🔗 ${siteUrl}/elon/${listing.id}` : '');
    sendTelegramMessage(telegramMessage).catch(() => {});

    return NextResponse.json({ message: "E'lon muvaffaqiyatli joylandi", listing }, { status: 201 });
  } catch (err) {
    console.error("E'lon qo'shishda xatolik:", err);
    return NextResponse.json({ message: "E'lonni saqlab bo'lmadi, qayta urinib ko'ring" }, { status: 500 });
  }
}
