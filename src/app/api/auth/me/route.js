// app/api/auth/me/route.js - Joriy foydalanuvchini qaytaradi
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Tizimga kirilmagan" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error("/me xatosi:", err);
    return NextResponse.json({ message: "Server xatoligi yuz berdi" }, { status: 500 });
  }
}
