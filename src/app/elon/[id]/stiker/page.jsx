// app/elon/[id]/stiker/page.jsx - Chop etiladigan "SOTILADI" stikeri (A4)
// QR-kod e'lon sahifasiga olib boradi. Faqat e'lon egasi ochishi mumkin.
import { notFound, redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { formatPrice } from '@/lib/labels';
import PrintButton from '@/components/PrintButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Stiker chop etish — E'lonUz" };

function prettyPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  const local = d.length >= 12 ? d.slice(3) : d.slice(-9);
  return local.length === 9 ? `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}` : phone;
}

export default async function StickerPage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect('/kirish');

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) notFound();
  if (listing.ownerId !== user.id) redirect('/kabinet');

  const base = String(process.env.NEXT_PUBLIC_SITE_URL || 'https://elonuz.com').replace(/\/+$/, '');
  const url = `${base}/elon/${listing.id}?manba=stiker`;
  const qrSvg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'M', margin: 0, color: { dark: '#0b1220', light: '#ffffff' } });
  const big = searchParams.variant !== 'kichik'; // A4 yoki yarim varaq

  return (
    <div className="sticker-wrap">
      <div className="no-print max-w-3xl mx-auto px-4 pt-6 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">🖨 "SOTILADI" stikeri</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chop eting va mashina oynasiga yoki darvozaga yopishtiring. QR-kod skanerlansa, e'loningiz ochiladi.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`?variant=${big ? 'kichik' : 'katta'}`} className="btn-secondary !py-2 !px-4 !text-sm">
            {big ? 'Kichik (A5)' : 'Katta (A4)'}
          </a>
          <PrintButton />
        </div>
      </div>

      <div className={`sticker-sheet ${big ? 'sticker-a4' : 'sticker-a5'}`}>
        <div className="sticker-head">SOTILADI</div>
        <div className="sticker-body">
          <div className="sticker-title">{listing.title}</div>
          <div className="sticker-price">{formatPrice(listing.price, listing.currency)}</div>
          <div className="sticker-phone">📞 {prettyPhone(listing.contactPhone)}</div>
          <div className="sticker-qr-row">
            <div className="sticker-qr" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <div className="sticker-qr-text">
              <b>Rasmlar va batafsil ma'lumot</b>
              <span>Telefon kamerasi bilan QR-kodni skanerlang</span>
            </div>
          </div>
        </div>
        <div className="sticker-foot">
          <b>E'lon</b>Uz — elonuz.com
        </div>
      </div>
    </div>
  );
}
