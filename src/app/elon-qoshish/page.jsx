// app/elon-qoshish/page.jsx - Yangi e'lon qo'shish (faqat tizimga kirganlar uchun)
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ListingForm from '@/components/ListingForm';

export const dynamic = 'force-dynamic';

export default async function AddListingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/kirish');
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📝 Yangi e'lon qo'shish</h1>
      <ListingForm mode="create" />
    </div>
  );
}
