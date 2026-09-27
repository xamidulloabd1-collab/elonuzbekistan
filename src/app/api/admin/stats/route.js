// app/api/admin/stats/route.js - Platforma statistikasi (faqat admin)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { PLAN_PRICE_UZS } from '@/lib/labels';
import {
  tashkentMidnight,
  tashkentMonthStart,
  tashkentDay,
  dayToDate,
  lastMonths,
  lastDays,
} from '@/lib/stats';

export const dynamic = 'force-dynamic';

const toMap = (rows, key, val) => Object.fromEntries(rows.map((r) => [r[key], Number(r[val])]));

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ message: 'Tizimga kirish talab qilinadi' }, { status: 401 });
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Ruxsat yo'q: bu amal faqat adminlar uchun" }, { status: 403 });
    }

    const now = new Date();
    const today = tashkentMidnight(0);
    const d7 = tashkentMidnight(6);
    const d30 = tashkentMidnight(29);
    const monthStart = tashkentMonthStart(0);
    const since12m = tashkentMonthStart(11);
    const activeSub = { subscriptionStatus: 'ACTIVE', subscriptionExpiresAt: { gt: now } };

    const [
      usersTotal, usersVerified, usersToday, users7, users30, usersReferred,
      listingsTotal, listingsActive, listingsVip, listingsToday, listings7, listings30,
      byCategory, byRegion, subsByPlan,
      conversations, messages30,
      usersMonthly, listingsMonthly, visitsDaily, visitsMonthly,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { phoneVerified: true } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: d7 } } }),
      prisma.user.count({ where: { createdAt: { gte: d30 } } }),
      prisma.user.count({ where: { referredById: { not: null } } }),

      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'ACTIVE', isVip: true } }),
      prisma.listing.count({ where: { createdAt: { gte: today } } }),
      prisma.listing.count({ where: { createdAt: { gte: d7 } } }),
      prisma.listing.count({ where: { createdAt: { gte: d30 } } }),

      prisma.listing.groupBy({ by: ['category'], where: { status: 'ACTIVE' }, _count: { _all: true } }),
      prisma.listing.groupBy({ by: ['region'], where: { status: 'ACTIVE' }, _count: { _all: true } }),
      prisma.user.groupBy({ by: ['subscriptionPlan'], where: activeSub, _count: { _all: true } }),

      prisma.conversation.count(),
      prisma.message.count({ where: { createdAt: { gte: d30 } } }),

      prisma.$queryRaw`
        SELECT to_char(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tashkent'), 'YYYY-MM') AS m, count(*)::int AS c
        FROM "users" WHERE "createdAt" >= ${since12m} GROUP BY 1`,
      prisma.$queryRaw`
        SELECT to_char(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tashkent'), 'YYYY-MM') AS m, count(*)::int AS c
        FROM "listings" WHERE "createdAt" >= ${since12m} GROUP BY 1`,
      prisma.$queryRaw`
        SELECT to_char("day", 'YYYY-MM-DD') AS d, count(*)::int AS visitors, sum("views")::int AS views
        FROM "site_visits" WHERE "day" >= ${dayToDate(tashkentDay(29))} GROUP BY "day"`,
      prisma.$queryRaw`
        SELECT to_char("day", 'YYYY-MM') AS m, count(*)::int AS visitors, sum("views")::int AS views
        FROM "site_visits" WHERE "day" >= ${dayToDate(lastMonths(12)[0] + '-01')} GROUP BY 1`,
    ]);

    // Faol obunalar va taxminiy oylik daromad
    const subs = { TADBIRKOR: 0, BIZNES: 0 };
    for (const s of subsByPlan) if (s.subscriptionPlan) subs[s.subscriptionPlan] = s._count._all;
    const monthlyRevenue = Object.entries(subs).reduce((sum, [plan, n]) => sum + n * (PLAN_PRICE_UZS[plan] || 0), 0);

    const months = lastMonths(12);
    const uM = toMap(usersMonthly, 'm', 'c');
    const lM = toMap(listingsMonthly, 'm', 'c');
    const vMv = toMap(visitsMonthly, 'm', 'visitors');
    const vMp = toMap(visitsMonthly, 'm', 'views');
    const monthly = months.map((m) => ({
      month: m,
      users: uM[m] || 0,
      listings: lM[m] || 0,
      visits: vMv[m] || 0,
      views: vMp[m] || 0,
    }));

    const days = lastDays(30);
    const vDv = toMap(visitsDaily, 'd', 'visitors');
    const vDp = toMap(visitsDaily, 'd', 'views');
    const daily = days.map((d) => ({ day: d, visits: vDv[d] || 0, views: vDp[d] || 0 }));
    const sumLast = (n, k) => daily.slice(-n).reduce((s, x) => s + x[k], 0);

    return NextResponse.json({
      generatedAt: now.toISOString(),
      users: { total: usersTotal, verified: usersVerified, today: usersToday, last7: users7, last30: users30, referred: usersReferred },
      listings: {
        total: listingsTotal, active: listingsActive, vip: listingsVip,
        today: listingsToday, last7: listings7, last30: listings30,
        byCategory: byCategory.map((c) => ({ key: c.category, count: c._count._all })).sort((a, b) => b.count - a.count),
        byRegion: byRegion.map((r) => ({ key: r.region, count: r._count._all })).sort((a, b) => b.count - a.count),
      },
      visits: {
        today: daily.at(-1).visits, todayViews: daily.at(-1).views,
        last7: sumLast(7, 'visits'), last30: sumLast(30, 'visits'), views30: sumLast(30, 'views'),
        daily,
      },
      revenue: { subscriptions: subs, monthlyRevenue, thisMonthNewUsers: uM[months.at(-1)] || 0 },
      chat: { conversations, messages30 },
      monthly,
      monthStart: monthStart.toISOString(),
    });
  } catch (err) {
    console.error('Statistikani olishda xatolik:', err);
    return NextResponse.json({ message: "Statistikani yuklab bo'lmadi" }, { status: 500 });
  }
}
