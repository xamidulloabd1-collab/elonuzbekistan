// components/Footer.jsx - Sahifa pastki qismi (Navbar bilan uyg'un, doim qorong'i)
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-950 border-t border-white/5 mt-10 pt-8 pb-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={36} height={36} className="h-8 w-8 opacity-90" />
          <span className="text-base font-extrabold text-white">
            E'lon<span className="text-brand-400">Uz</span>
          </span>
        </div>
        <p className="text-gray-500 text-xs tracking-wide">BUY · SELL · ONLINE</p>
        <Link href="/maxfiylik-siyosati" className="text-gray-500 hover:text-brand-400 text-xs">
          Maxfiylik siyosati
        </Link>
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} E'lonUz — Buyumlaringiz uchun eng yaxshi joy
        </p>
      </div>
    </footer>
  );
}
