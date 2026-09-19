// app/api/auth/logout/route.js - Tizimdan chiqish
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    clearAuthCookie();
    return NextResponse.json({ message: "Tizimdan chiqdingiz" });
  } catch (err) {
    console.error("Logout xatosi:", err);
    return NextResponse.json({ message: "Server xatoligi yuz berdi" }, { status: 500 });
  }
}
