// components/ListingCard.jsx - E'lon kartochkasi (ro'yxatlarda ko'rinadigan)
import Link from 'next/link';
import { ImageOff, MapPin, Eye, Star } from 'lucide-react';
import { CATEGORY_LABELS, REGION_LABELS, formatPrice } from '@/lib/labels';

export default function ListingCard({ listing }) {
  const image = listing.images?.[0];

  return (
    <Link
      href={`/elon/${listing.id}`}
      className="group card overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-glow-sm hover:border-brand-400/30 transition-all relative"
    >
      {listing.isVip && (
        <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
          <Star size={12} fill="currentColor" /> VIP
        </span>
      )}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-surface-800 flex items-center justify-center overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <ImageOff className="text-gray-300 dark:text-gray-700" size={40} />
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base line-clamp-2">{listing.title}</h3>
        <p className="text-brand-600 dark:text-brand-400 font-extrabold text-lg">
          {formatPrice(listing.price, listing.currency)}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-1">
          <span className="flex items-center gap-1"><MapPin size={12} /> {REGION_LABELS[listing.region]}</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {listing.views}</span>
        </div>
      </div>
    </Link>
  );
}
