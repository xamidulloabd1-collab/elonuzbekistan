// app/api/cron/listings/route.js - Har soatda (Netlify scheduled function) chaqiriladi:
// muddati yaqinlashgan e'lonlar egalariga eslatma + muddati tugaganlarni yashirish
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendExpiryReminders, expireDueListings } from '@/lib/listingLifecycle';

export const dynamic = 'force-dynamic';

function authorized(request) {
  const expected = process.env.CRON_SECRET;
  const got = request.headers.get('x-cron-secret') || '';
  if (!expected || got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export async function GET(request) {
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const reminders = await sendExpiryReminders();
    const expired = await expireDueListings();
    return NextResponse.json({ ok: true, reminders, expired });
  } catch (err) {
    console.error('Cron xatosi:', err);
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
