// app/api/ai/description/route.js - Sun'iy intellekt yordamida e'lon tavsifini yozish
//
// .env: ANTHROPIC_API_KEY (console.anthropic.com -> API Keys). Sozlanmagan bo'lsa
// tugma "vaqtincha ishlamaydi" deb javob beradi. Har bir foydalanuvchiga kuniga
// AI_DAILY_LIMIT marta (standart: 5) - xarajatni nazorat qilish uchun.
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CATEGORY_LABELS, REGION_LABELS, formatPrice } from '@/lib/labels';
import { tashkentDay, dayToDate } from '@/lib/stats';

const MODEL = 'claude-haiku-4-5-20251001';
const dailyLimit = () => Number(process.env.AI_DAILY_LIMIT) || 5;

const SYSTEM_PROMPT = `Sen O'zbekistondagi e'lonlar sayti (E'lonUz) uchun e'lon tavsiflarini yozadigan yordamchisan.
Qoidalar:
- Faqat o'zbek tilida, lotin yozuvida yoz.
- 4-7 qisqa jumla yoki qisqa ro'yxat: mahsulot/xizmat haqida, kimga mos, nega foydali.
- Foydalanuvchi bermagan aniq faktlarni (yurgan masofa, holati, xotirasi, maydoni, yil va h.k.) O'YLAB TOPMA.
  Bunday ma'lumot kerak bo'lsa, kvadrat qavsda bo'sh joy qoldir, masalan: [yurgan masofasi: ... km].
- Bo'rttirma reklama, "eng zo'r", "100% kafolat" kabi va'dalar yozma.
- Telefon raqami, narx yoki manzilni tavsifga qo'shma (ular alohida maydonlarda bor).
- Oxirida xaridorni bog'lanishga undovchi bitta qisqa jumla yoz.
- Faqat tavsif matnini qaytar - sarlavha, izoh yoki qo'shtirnoqsiz.`;

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ message: 'Bu funksiya vaqtincha ishlamayapti' }, { status: 503 });
    }

    const body = await request.json().catch(() => ({}));
    const title = String(body.title || '').trim().slice(0, 120);
    if (title.length < 3) {
      return NextResponse.json({ message: 'Avval sarlavhani yozing (masalan: "Cobalt 2019, oq")' }, { status: 400 });
    }
    const notes = String(body.description || '').trim().slice(0, 1000);

    // Kunlik limit (atomar: avval hisoblagichni oshiramiz, limitdan oshsa - qaytaramiz)
    const DAILY_LIMIT = dailyLimit();
    const day = dayToDate(tashkentDay());
    const usage = await prisma.aiUsage.upsert({
      where: { userId_day: { userId: user.id, day } },
      create: { userId: user.id, day, count: 1 },
      update: { count: { increment: 1 } },
    });
    if (usage.count > DAILY_LIMIT) {
      return NextResponse.json({ message: `Bugungi limit tugadi (kuniga ${DAILY_LIMIT} marta). Ertaga yana urinib ko'ring` }, { status: 429 });
    }

    const facts = [
      `Sarlavha: ${title}`,
      body.category && CATEGORY_LABELS[body.category] ? `Kategoriya: ${CATEGORY_LABELS[body.category]}` : null,
      body.region && REGION_LABELS[body.region] ? `Hudud: ${REGION_LABELS[body.region]}` : null,
      Number(body.price) > 0 ? `Narx: ${formatPrice(body.price, body.currency)}` : null,
      body.installment ? "Bo'lib to'lash mumkin" : null,
      body.exchangeable ? 'Almashtirish mumkin' : null,
      notes ? `Sotuvchining o'z yozganlari (shulardan foydalan): ${notes}` : null,
    ].filter(Boolean);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `E'lon uchun tavsif yoz.\n${facts.join('\n')}` }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('Anthropic API xatosi:', res.status, JSON.stringify(data).slice(0, 300));
      // Muvaffaqiyatsiz urinish limitdan ayrilmasin
      await prisma.aiUsage.update({ where: { userId_day: { userId: user.id, day } }, data: { count: { decrement: 1 } } }).catch(() => {});
      return NextResponse.json({ message: "Tavsif yozib bo'lmadi, birozdan keyin urinib ko'ring" }, { status: 502 });
    }

    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
    return NextResponse.json({ description: text.slice(0, 2000), remaining: Math.max(0, DAILY_LIMIT - usage.count) });
  } catch (err) {
    console.error('AI tavsif xatosi:', err);
    return NextResponse.json({ message: 'Xatolik yuz berdi' }, { status: 500 });
  }
}
