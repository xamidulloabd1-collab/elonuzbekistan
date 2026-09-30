// app/api/admin/reports/route.js - Shikoyatlar ro'yxati (faqat admin)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Tizimga kirish talab qilinadi' }, { status: 401 });
  if (!isAdmin(user)) return NextResponse.json({ message: "Ruxsat yo'q" }, { status: 403 });

  const status = new URL(request.url).searchParams.get('status') === 'RESOLVED' ? 'RESOLVED' : 'OPEN';
  const reports = await prisma.report.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      reporter: { select: { id: true, name: true, phone: true } },
      reportedUser: { select: { id: true, name: true, phone: true } },
      listing: { select: { id: true, title: true, status: true } },
    },
  });
  return NextResponse.json({ reports });
}
