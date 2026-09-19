// app/api/auth/register/route.js - Ro'yxatdan o'tish
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { validateRegister } from '@/lib/validators';

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors, data } = validateRegister(body);

    if (!valid) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    // Telefon raqam band qilinganligini tekshirish
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) {
      return NextResponse.json(
        { message: "Bu telefon raqam bilan foydalanuvchi allaqachon mavjud" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        passwordHash,
      },
      select: { id: true, name: true, phone: true, role: true },
    });

    const token = signToken(user);
    setAuthCookie(token);

    return NextResponse.json({ message: "Ro'yxatdan muvaffaqiyatli o'tdingiz", user }, { status: 201 });
  } catch (err) {
    console.error("Register xatosi:", err);
    return NextResponse.json({ message: "Server xatoligi yuz berdi, qayta urinib ko'ring" }, { status: 500 });
  }
}
