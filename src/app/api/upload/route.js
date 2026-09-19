// app/api/upload/route.js - Rasm faylini qabul qilib, Netlify Blobs'ga saqlaydi
//
// Nega Cloudinary emas: Cloudinary O'zbekistondan ro'yxatdan o'tishni
// bloklaydi ("geo_location_not_permitted"). Netlify Blobs esa sayt
// joylashtirilgan Netlify platformasining o'zida ishlaydi - alohida
// tashqi hisob kerak emas.

import { NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { getCurrentUser } from '@/lib/auth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Rasm yuklash uchun tizimga kiring" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: "Fayl topilmadi" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Faqat JPG, PNG, WEBP yoki GIF formatidagi rasmlar qabul qilinadi" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Rasm hajmi 5 MB dan oshmasligi kerak" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split('/')[1] || 'jpg';
    const key = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const store = getStore('listing-images');
    await store.set(key, buffer, { metadata: { contentType: file.type } });

    // Bu URL keyinchalik rasmni ko'rsatish uchun ishlatiladi (pastdagi [key]/route.js)
    return NextResponse.json({ url: `/api/upload/${key}` }, { status: 201 });
  } catch (err) {
    console.error("Rasm yuklashda xatolik:", err);
    // Netlify Blobs faqat Netlify'ning o'zida (yoki `netlify dev` orqali) ishlaydi -
    // oddiy `next dev` bilan lokal sinovda shu xato chiqishi mumkin
    return NextResponse.json(
      { message: "Rasm yuklab bo'lmadi. Agar buni lokal kompyuterda sinayotgan bo'lsangiz, Netlify'ning o'zida (jonli saytda) sinab ko'ring." },
      { status: 500 }
    );
  }
}
