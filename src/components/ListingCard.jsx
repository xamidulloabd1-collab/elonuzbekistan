// components/ListingCard.jsx - E'lon kartochkasi (ro'yxatlarda ko'rinadigan)
import Link from 'next/link';
import { ImageOff, MapPin, Eye, Star } from 'lucide-react';
import { CATEGORY_LABELS, REGION_LABELS, formatPrice } from '@/lib/labels';
import FavoriteButton from './FavoriteButton';

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
      <FavoriteButton listingId={listing.id} size={16} className="absolute top-2 right-2 z-10" />
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
        {(listing.installment || listing.exchangeable) && (
          <div className="flex flex-wrap gap-1">
            {listing.installment && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">💳 Bo'lib to'lash</span>
            )}
            {listing.exchangeable && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">🔄 Almashtiraman</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-1">
          <span className="flex items-center gap-1"><MapPin size={12} /> <span className="truncate max-w-[110px]">{listing.district || REGION_LABELS[listing.region]}</span></span>
          <span className="flex items-center gap-1"><Eye size={12} /> {listing.views}</span>
        </div>
      </div>
    </Link>
  );
}
