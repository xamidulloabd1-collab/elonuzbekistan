// app/kabinet/page.jsx - Foydalanuvchi kabineti (dashboard)
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import MyListingsList from '@/components/MyListingsList';
import { PLAN_LABELS } from '@/lib/labels';

export const dynamic = 'force-dynamic';

function formatDate(date) {
  return new Date(date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function SubscriptionBadge({ user }) {
  const status = user.subscriptionStatus;
  const isActiveNow = status === 'ACTIVE' && user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) > new Date();

  if (status === 'ACTIVE' && isActiveNow) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
          ✅ {PLAN_LABELS[user.subscriptionPlan]} — {formatDate(user.subscriptionExpiresAt)}gacha faol
        </span>
        {user.subscriptionPlan === 'TADBIRKOR' && (
          <span className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-bold px-3 py-1 rounded-full">
            ⭐ VIP: {user.vipListingsUsed}/3 ishlatilgan
          </span>
        )}
      </div>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
        ⏳ {PLAN_LABELS[user.subscriptionPlan]} — tasdiq kutilmoqda
      </span>
    );
  }
  if (status === 'EXPIRED' || (status === 'ACTIVE' && !isActiveNow)) {
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
        ⌛ Muddati tugagan
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-surface-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full">
      Boshlang'ich (Bepul)
    </span>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/kirish');
  }

  let listings = [];
  try {
    listings = await prisma.listing.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error("Mening e'lonlarimni olishda xatolik:", err.message);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">👤 {user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">📞 {user.phone}</p>
          <div className="mt-2"><SubscriptionBadge user={user} /></div>
        </div>
        <Link href="/tariflar" className="btn-secondary text-center">
          {user.subscriptionStatus === 'ACTIVE' ? "Tarifni yangilash" : "Tarif sotib olish"}
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Mening e'lonlarim</h2>
        <Link href="/elon-qoshish" className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1">
          <Plus size={16} /> Yangi e'lon
        </Link>
      </div>

      <MyListingsList initialListings={listings} />
    </div>
  );
}
