// lib/labels.js - Enum qiymatlarini o'zbekcha o'qiladigan nomlarga moslashtirish

export const CATEGORY_LABELS = {
  KOCHMAS_MULK: "🏠 Ko'chmas mulk",
  TRANSPORT: "🚗 Transport",
  AVTO_EHTIYOT_QISMLAR: "🔧 Avto ehtiyot qismlar",
  ELEKTRONIKA: "💻 Elektronika",
  ISH_ORINLARI: "💼 Ish o'rinlari",
  XIZMATLAR: "🛠️ Xizmatlar",
  UY_JIHOZLARI: "🛋️ Uy jihozlari",
  KIYIM_ODA: "👕 Kiyim-kechak",
  BOSHQA: "📦 Boshqa",
};

export const REGION_LABELS = {
  TOSHKENT_SHAHAR: "Toshkent shahri",
  ANDIJON: "Andijon",
  BUXORO: "Buxoro",
  FARGONA: "Farg'ona",
  JIZZAX: "Jizzax",
  XORAZM: "Xorazm",
  NAMANGAN: "Namangan",
  NAVOIY: "Navoiy",
  QASHQADARYO: "Qashqadaryo",
  QORAQALPOGISTON: "Qoraqalpog'iston",
  SAMARQAND: "Samarqand",
  SIRDARYO: "Sirdaryo",
  SURXONDARYO: "Surxondaryo",
  TOSHKENT_VILOYATI: "Toshkent viloyati",
};

export const CURRENCY_LABELS = {
  UZS: "so'm",
  USD: "$",
};

export const PLAN_LABELS = {
  TADBIRKOR: "Tadbirkor",
  BIZNES: "Biznes/Makler",
};

export const PLAN_PRICES = {
  TADBIRKOR: "14 990 so'm/oy",
  BIZNES: "24 990 so'm/oy",
};

export function formatPrice(price, currency = 'UZS') {
  const num = Number(price);
  const formatted = num.toLocaleString('uz-UZ');
  return currency === 'USD' ? `$${formatted}` : `${formatted} so'm`;
}
