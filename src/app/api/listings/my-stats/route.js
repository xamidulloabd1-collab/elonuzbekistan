// app/api/listings/my-stats/route.js - Kabinet: o'z e'lonlarim statistikasi (oxirgi 7 kun)
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOwnerStats } from '@/lib/listingStats';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Tizimga kiring' }, { status: 401 });
  try {
    return NextResponse.json({ stats: await getOwnerStats(user.id) });
  } catch (err) {
    console.error('Statistikani olishda xatolik:', err);
    return NextResponse.json({ stats: {} });
  }
}
