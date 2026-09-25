// app/admin/page.jsx - Admin panel sahifasi (faqat role === 'ADMIN')
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import AdminTabs from '@/components/AdminTabs';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/kirish');
  }
  if (!isAdmin(user)) {
    redirect('/'); // admin bo'lmagan foydalanuvchi bosh sahifaga qaytariladi
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <AdminTabs />
    </div>
  );
}
