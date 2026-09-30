// netlify/functions/listings-cron.mjs - Netlify har soatda o'zi ishga tushiradi.
// Saytdagi /api/cron/listings manzilini chaqiradi (e'lon muddatlari va eslatmalar).
// Netlify'da CRON_SECRET o'zgaruvchisi bo'lishi kerak.

export default async () => {
  const base = process.env.URL; // Netlify avtomatik beradi (masalan https://elonuz.com)
  if (!base || !process.env.CRON_SECRET) {
    console.error('listings-cron: URL yoki CRON_SECRET topilmadi');
    return new Response('not configured', { status: 500 });
  }
  const res = await fetch(`${base}/api/cron/listings`, {
    headers: { 'x-cron-secret': process.env.CRON_SECRET },
  });
  const body = await res.text();
  console.log('listings-cron:', res.status, body);
  return new Response(body, { status: res.status });
};

export const config = {
  schedule: '@hourly',
};
