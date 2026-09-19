// middleware.js - Himoyalangan sahifalarga erta yo'naltirish
//
// Eslatma: bu yerda faqat cookie MAVJUDLIGINI tekshiramiz (tezkor, Edge
// runtime'da ishlaydigan tekshiruv). Tokenning haqiqiy yaroqliligi
// (imzosi, muddati) har bir sahifa/route'ning o'zida `getCurrentUser()`
// orqali serverda to'liq tekshiriladi - shuning uchun bu middleware
// yagona himoya emas, faqat foydalanuvchi tajribasini yaxshilash uchun
// erta yo'naltiruvchi qatlam hisoblanadi.

import { NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/kabinet', '/elon-qoshish', '/admin'];
const COOKIE_NAME = 'elonuz_token';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // "/elon/:id/tahrirlash" ham himoyalangan
  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    /^\/elon\/[^/]+\/tahrirlash$/.test(pathname);

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL('/kirish', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/kabinet/:path*', '/elon-qoshish/:path*', '/admin/:path*', '/elon/:id/tahrirlash'],
};
