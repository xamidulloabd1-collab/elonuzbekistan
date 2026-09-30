// app/hisobni-ochirish/page.jsx - Hisobni va ma'lumotlarni o'chirish tartibi
// (Google Play "Data deletion" talabi uchun ommaviy sahifa - login talab qilinmaydi)
import Link from 'next/link';

export const metadata = {
  title: "Hisobni o'chirish — E'lonUz",
  description: "E'lonUz hisobingiz va ma'lumotlaringizni qanday o'chirish mumkin",
};

export default function DeleteAccountInfoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Hisobni o'chirish</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        E'lonUz (elonuz.com va mobil ilova) hisobingizni va unga tegishli barcha ma'lumotlarni istalgan vaqtda o'chirishingiz mumkin.
      </p>

      <div className="card p-5 sm:p-6 mb-6">
        <h2 className="font-bold text-lg mb-3">Qanday o'chiriladi</h2>
        <ol className="list-decimal pl-5 flex flex-col gap-2 text-gray-700 dark:text-gray-300">
          <li>
            Saytga yoki ilovaga <Link href="/kirish" className="text-brand-600 dark:text-brand-400 font-semibold">kiring</Link>.
          </li>
          <li>
            <b>Kabinet → ⚙️ Profil sozlamalari</b> bo'limiga o'ting.
          </li>
          <li>
            Pastdagi <b>"Hisobni o'chirish"</b> bo'limida parolingizni kiriting va tasdiqlang.
          </li>
        </ol>
        <Link href="/kabinet/sozlamalar#hisobni-ochirish" className="btn-primary inline-block mt-5">
          Sozlamalarga o'tish
        </Link>
      </div>

      <div className="card p-5 sm:p-6 mb-6">
        <h2 className="font-bold text-lg mb-3">Nimalar o'chiriladi</h2>
        <ul className="list-disc pl-5 flex flex-col gap-1.5 text-gray-700 dark:text-gray-300">
          <li>Profil: ism, telefon raqam, parol, Telegram ulanishi</li>
          <li>Barcha e'lonlaringiz va ularning rasmlari (Telegram kanaldagi postlar ham)</li>
          <li>Sevimli e'lonlar ro'yxati</li>
          <li>Suhbatlar va xabarlar</li>
          <li>Bloklash ro'yxati, yuborgan shikoyatlaringiz va tasdiqlash kodlari</li>
        </ul>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Ma'lumotlar darhol va butunlay o'chiriladi, ularni qayta tiklab bo'lmaydi. Saytga tashriflar statistikasi anonim
          bo'lgani uchun hech kimga bog'lanmaydi.
        </p>
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="font-bold text-lg mb-2">Kira olmayapsizmi?</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Parolingizni unutgan bo'lsangiz, avval{' '}
          <Link href="/parolni-tiklash" className="text-brand-600 dark:text-brand-400 font-semibold">parolni tiklang</Link>, so'ng
          yuqoridagi tartibda hisobni o'chiring.
        </p>
      </div>
    </div>
  );
}
