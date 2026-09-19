// app/elon/[id]/tahrirlash/page.jsx - E'lonni tahrirlash (faqat egasi uchun)
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ListingForm from '@/components/ListingForm';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/kirish');
  }

  let listing;
  try {
    listing = await prisma.listing.findUnique({ where: { id: params.id } });
  } catch (err) {
    console.error("E'lonni olishda xatolik:", err.message);
    listing = null;
  }

  if (!listing) {
    notFound();
  }

  // Faqat e'lon egasi tahrirlashi mumkin - boshqa foydalanuvchi to'g'ridan-to'g'ri
  // URL orqali kirishga urinsa ham, bosh sahifaga qaytariladi.
  if (listing.ownerId !== user.id) {
    redirect('/kabinet');
  }

  const initialData = {
    title: listing.title,
    description: listing.description,
    category: listing.category,
    region: listing.region,
    price: String(listing.price),
    currency: listing.currency,
    contactPhone: listing.contactPhone,
    images: listing.images,
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">✏️ E'lonni tahrirlash</h1>
      <ListingForm mode="edit" listingId={listing.id} initialData={initialData} />
    </div>
  );
}
