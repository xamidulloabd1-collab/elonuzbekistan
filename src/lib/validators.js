// lib/validators.js - Server tomonida kiritilgan ma'lumotlarni tekshirish
//
import { toUzPhone } from './phone';
import { isValidDistrict } from '../data/districts';

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

export const PHONE_ERROR = "O'zbekiston telefon raqamini kiriting (masalan: +998 90 123 45 67)";
export const MIN_PASSWORD = 6;

export function validateRegister(body) {
  const errors = {};
  const name = (body.name || '').trim();
  const phone = toUzPhone(body.phone); // "998XXXXXXXXX" yoki null
  const password = body.password || '';

  if (!name || name.length < 2) errors.name = "Ismingizni kiriting";
  if (name.length > 60) errors.name = "Ism juda uzun";
  if (!phone) errors.phone = PHONE_ERROR;
  if (password.length < MIN_PASSWORD) errors.password = `Parol kamida ${MIN_PASSWORD} belgidan iborat bo'lishi kerak`;

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
  const images = Array.isArray(body.images) ? body.images.filter(Boolean).slice(0, 5) : [];

  // Tuman ixtiyoriy, lekin berilgan bo'lsa - tanlangan hududga tegishli bo'lishi kerak
  let district = typeof body.district === 'string' ? body.district.trim() : '';
  if (district && !isValidDistrict(region, district)) {
    errors.district = "Tumanni ro'yxatdan tanlang";
    district = '';
  }
  const exchangeable = body.exchangeable === true || body.exchangeable === 'true';
  const installment = body.installment === true || body.installment === 'true';

  // Xaritadagi joylashuv ixtiyoriy. Berilgan bo'lsa - O'zbekiston chegarasi ichida bo'lishi kerak.
  let latitude = null;
  let longitude = null;
  if (body.latitude !== undefined && body.latitude !== null && body.latitude !== '') {
    latitude = Number(body.latitude);
    longitude = Number(body.longitude);
    const inUz = latitude >= 37.0 && latitude <= 45.7 && longitude >= 55.8 && longitude <= 73.3;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !inUz) {
      errors.location = "Xaritada O'zbekiston hududidagi joyni belgilang";
      latitude = null;
      longitude = null;
    } else {
      // ~1 metr aniqlik yetarli
      latitude = Math.round(latitude * 1e5) / 1e5;
      longitude = Math.round(longitude * 1e5) / 1e5;
    }
  }

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
    data: { title, description, category, region, price, currency, contactPhone, images, latitude, longitude, district: district || null, exchangeable, installment },
  };
}
