// lib/mapUtils.js - Xarita uchun umumiy yordamchilar

/** Xarita belgisidagi qisqa narx: 350 mln, 1,2 mlrd, 850 ming, $35 000 */
export function shortPrice(price, currency = 'UZS') {
  const n = Number(price) || 0;
  if (currency === 'USD') return `$${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
  const fmt = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
  if (n >= 1e9) return `${fmt(n / 1e9)} mlrd`;
  if (n >= 1e6) return `${fmt(n / 1e6)} mln`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} ming`;
  return `${n} so'm`;
}

export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
