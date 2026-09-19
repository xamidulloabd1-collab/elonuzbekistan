'use client';
// components/Pagination.jsx - Sahifalar bo'ylab o'tish
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(p) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/elonlar?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page <= 1}
        className="btn-secondary !py-2 !px-3 disabled:opacity-40"
        aria-label="Oldingi sahifa"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary !py-2 !px-3 disabled:opacity-40"
        aria-label="Keyingi sahifa"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
