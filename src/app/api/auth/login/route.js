// app/api/auth/login/route.js - Tizimga kirish
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, setAuthCookie } from '@/lib/auth';
import { validateLogin } from '@/lib/validators';

export async function POST(request) {
  try {
    const body = await request.json();
    const { valid, errors, data } = validateLogin(body);

    if (!valid) {
      return NextResponse.json({ message: "Ma'lumotlarni to'g'ri kiriting", errors }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone: data.phone } });

    if (!user) {
      return NextResponse.json({ message: "Telefon raqam yoki parol noto'g'ri" }, { status: 401 });
    }

    const passwordOk = await verifyPassword(data.password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ message: "Telefon raqam yoki parol noto'g'ri" }, { status: 401 });
    }

    const token = signToken(user);
    setAuthCookie(token);

    return NextResponse.json({
      message: "Muvaffaqiyatli kirdingiz",
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("Login xatosi:", err);
    return NextResponse.json({ message: "Server xatoligi yuz berdi, qayta urinib ko'ring" }, { status: 500 });
  }
}
