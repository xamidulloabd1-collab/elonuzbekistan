// components/Footer.jsx - Sahifa pastki qismi (Navbar bilan uyg'un, doim qorong'i)
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-surface-950 border-t border-white/5 mt-10 pt-8 pb-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4">
        <Image src="/logo-mark.png" alt="Elon" width={110} height={79} className="h-9 w-auto opacity-90" />
        <p className="text-gray-500 text-xs tracking-wide">BUY · SELL · ONLINE</p>
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Elon — Buyumlaringiz uchun eng yaxshi joy
        </p>
      </div>
    </footer>
  );
}
