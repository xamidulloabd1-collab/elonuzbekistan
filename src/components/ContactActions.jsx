// components/ContactActions.jsx - E'lon egasi bilan bog'lanish tugmalari
import { Phone, Send } from 'lucide-react';

export default function ContactActions({ phone, telegramUsername }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={`tel:${phone}`}
        className="btn-primary flex-1 flex items-center justify-center gap-2"
      >
        <Phone size={18} /> {phone}
      </a>
      {telegramUsername && (
        <a
          href={`https://t.me/${telegramUsername.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1c8ac2] text-white font-bold py-3 px-6 rounded-xl text-base transition"
        >
          <Send size={18} /> Telegram orqali yozish
        </a>
      )}
    </div>
  );
}
