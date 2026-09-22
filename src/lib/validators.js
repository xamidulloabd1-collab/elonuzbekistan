// lib/validators.js - Server tomonida kiritilgan ma'lumotlarni tekshirish
//
// Har bir funksiya { valid: boolean, errors: { [maydon]: xabar } } qaytaradi.
// Bu shakl frontend'da har bir maydon ostiga alohida xatolik chiqarishni osonlashtiradi.

export const CATEGORIES = [
  'KOCHMAS_MULK', 'TRANSPORT', 'AVTO_EHTIYOT_QISMLAR', 'ELEKTRONIKA', 'ISH_ORINLARI',
  'XIZMATLAR', 'UY_JIHOZLARI', 'KIYIM_ODA', 'BOSHQA'
];

export const REGIONS = [
  'TOSHKENT_SHAHAR', 'ANDIJON', 'BUXORO', 'FARGONA', 'JIZZAX', 'XORAZM',
  'NAMANGAN', 'NAVOIY', 'QASHQADARYO', 'QORAQALPOGISTON', 'SAMARQAND',
  'SIRDARYO', 'SURXONDARYO', 'TOSHKENT_VILOYATI'
];

export const CURRENCIES = ['UZS', 'USD'];

function normalizePhone(phone) {
  return String(phone || '').replace(/[^\d+]/g, '');
}

export function validateRegister(body) {
  const errors = {};
  const name = (body.name || '').trim();
  const phone = normalizePhone(body.phone);
  const password = body.password || '';

  if (!name) errors.name = "Ismingizni kiriting";
  if (!phone || phone.length < 9) errors.phone = "To'g'ri telefon raqam kiriting";
  if (!password || password.length < 4) errors.password = "Parol kamida 4 belgidan iborat bo'lishi kerak";

  return { valid: Object.keys(errors).length === 0, errors, data: { name, phone, password } };
}

export function validateLogin(body) {
  const errors = {};
  const phone = normalizePhone(body.phone);
  const password = body.password || '';

  if (!phone) errors.phone = "Telefon raqamni kiriting";
  if (!password) errors.password = "Parolni kiriting";

  return { valid: Object.keys(errors).length === 0, errors, data: { phone, password } };
}

export function validateListing(body) {
  const errors = {};

  const title = (body.title || '').trim();
  const description = (body.description || '').trim();
  const category = body.category;
  const region = body.region;
  const price = Number(body.price);
  const currency = body.currency || 'UZS';
  const contactPhone = normalizePhone(body.contactPhone);
  const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];

  if (!title || title.length < 3) errors.title = "Sarlavha kamida 3 belgidan iborat bo'lishi kerak";
  if (!description || description.length < 10) errors.description = "Tavsif kamida 10 belgidan iborat bo'lishi kerak";
  if (!CATEGORIES.includes(category)) errors.category = "Kategoriyani tanlang";
  if (!REGIONS.includes(region)) errors.region = "Hududni tanlang";
  if (!Number.isFinite(price) || price < 0) errors.price = "To'g'ri narx kiriting";
  if (!CURRENCIES.includes(currency)) errors.currency = "Valyutani tanlang";
  if (!contactPhone || contactPhone.length < 9) errors.contactPhone = "To'g'ri aloqa raqamini kiriting";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { title, description, category, region, price, currency, contactPhone, images },
  };
}
