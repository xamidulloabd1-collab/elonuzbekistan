// app/tariflar/page.jsx - Tariflar: obunaga ariza berish
import { getCurrentUser } from '@/lib/auth';
import TariffForm from '@/components/TariffForm';

export const dynamic = 'force-dynamic';

export default async function TariffsPage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-2">Tariflarni tanlang</h1>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        Sizga mos tarifni tanlang — ariza yuborilgach, operator siz bilan bog'lanadi va admin panelda tasdiqlanadi
      </p>
      <TariffForm user={user} />
    </div>
  );
}
