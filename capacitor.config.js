// capacitor.config.js
//
// Bu fayl mobil ilovaning (Android/iOS) "jonli saytga oyna" bo'lib ishlashini
// ta'minlaydi. `server.url` qatoridagi manzilni HAQIQIY domeningizga
// almashtirganingizdan so'ng, ilova doim shu saytni ko'rsatib turadi -
// saytga har qanday yangilanish kiritsangiz, ilova ham darhol (qayta
// do'konga yubormasdan) yangilanadi.
//
// ⚠️ HOZIRCHA (domen tayyor bo'lmagunча): pastdagi APP_URL o'zgaruvchisini
// o'zingizning kompyuteringiz tarmoq manzili yoki ngrok kabi vaqtinchalik
// tunnel havolasiga o'zgartirib, telefoningizda sinab ko'rishingiz mumkin.
// Batafsili README.md dagi "Mobil ilova (Capacitor)" bo'limida.

const APP_URL = process.env.CAPACITOR_APP_URL || 'https://SIZNING-DOMENINGIZ.uz';

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'uz.elon.app',
  appName: 'Elon',
  webDir: 'public', // Capacitor buni talab qiladi, lekin server.url ishlatilgani uchun bu papka amalda ko'rsatilmaydi
  server: {
    url: APP_URL,
    cleartext: false, // faqat https (production uchun xavfsiz)
  },
};

module.exports = config;
