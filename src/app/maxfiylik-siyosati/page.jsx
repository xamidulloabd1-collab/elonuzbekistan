// app/maxfiylik-siyosati/page.jsx - Maxfiylik siyosati (Google Play uchun talab qilinadi)
export const metadata = {
  title: "Maxfiylik siyosati — E'lonUz",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-2">Maxfiylik siyosati</h1>
      <p className="text-gray-400 text-sm mb-8">Oxirgi yangilanish: 2026-yil</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">1. Umumiy ma'lumot</h2>
          <p className="text-gray-600 dark:text-gray-300">
            "E'lonUz" platformasi (bundan buyon — "biz", "platforma") O'zbekiston
            bo'ylab e'lonlar joylash va qidirish xizmatini taqdim etadi. Ushbu
            hujjat foydalanuvchilarimizning shaxsiy ma'lumotlarini qanday
            to'plashimiz, ishlatishimiz va saqlashimizni tushuntiradi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">2. Biz qanday ma'lumotlarni to'playmiz</h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
            <li><strong>Ro'yxatdan o'tishda:</strong> ismingiz va telefon raqamingiz.</li>
            <li><strong>E'lon joylashda:</strong> e'lon matni, narxi, hududi, aloqa raqami va siz yuklagan rasmlar.</li>
            <li><strong>Avtomatik:</strong> e'lonlaringiz ko'rishlar soni (statistika uchun).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">3. Ma'lumotlardan qanday foydalanamiz</h2>
          <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
            <li>Hisobingizni yaratish va tizimga kirishingizni ta'minlash uchun.</li>
            <li>E'loningizni boshqa foydalanuvchilarga ko'rsatish uchun.</li>
            <li>Boshqa foydalanuvchilar sizning e'loningiz bilan bog'liq bo'lsa, siz bilan (telefon yoki Telegram orqali) bog'lanishi uchun.</li>
            <li>Tarif arizalaringizni ko'rib chiqish uchun operatorimizga Telegram orqali xabar yuboramiz.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">4. Ma'lumotlarni saqlash</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Ma'lumotlaringiz shifrlangan holatda, ishonchli bulutli
            infratuzilmada (PostgreSQL ma'lumotlar bazasi) saqlanadi. Parolingiz
            hech qachon ochiq matn ko'rinishida saqlanmaydi — u xavfsiz xesh
            (bcrypt) algoritmi orqali qayta ishlanadi. Yuklagan rasmlaringiz
            Netlify'ning fayl saqlash xizmatida saqlanadi.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">5. Ma'lumotlarni uchinchi shaxslar bilan ulashish</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Biz sizning shaxsiy ma'lumotlaringizni reklama kompaniyalariga
            sotmaymiz. E'loningizdagi aloqa raqami (siz o'zingiz kiritgan)
            saytda ochiq ko'rinadi, chunki bu xaridorlar siz bilan bog'lanishi
            uchun zarur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">6. Foydalanuvchi huquqlari</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Siz istalgan vaqtda o'z e'lonlaringizni tahrirlash yoki o'chirish
            huquqiga egasiz. Agar hisobingizni butunlay o'chirishni
            xohlasangiz, biz bilan quyidagi bo'lim orqali bog'laning.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">7. Biz bilan bog'lanish</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Maxfiylik siyosatimiz yuzasidan savollaringiz bo'lsa, sayt orqali
            yoki quyidagi Telegram bot orqali biz bilan bog'lanishingiz mumkin:{' '}
            <a
              href={`https://t.me/${(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'elonuz_bot').replace('@', '')}`}
              className="text-brand-600 dark:text-brand-400 font-semibold"
            >
              Telegram
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
