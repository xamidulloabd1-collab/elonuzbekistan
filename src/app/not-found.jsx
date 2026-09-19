// app/not-found.jsx - 404 sahifasi
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <SearchX className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
      <h1 className="text-2xl font-bold mb-2">Sahifa topilmadi</h1>
      <p className="text-gray-400 mb-6">Siz qidirayotgan e'lon yoki sahifa mavjud emas yoki o'chirilgan.</p>
      <Link href="/" className="btn-primary inline-block">Bosh sahifaga qaytish</Link>
    </div>
  );
}
