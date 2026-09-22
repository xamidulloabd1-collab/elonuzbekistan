// app/layout.jsx - Ildiz layout: barcha sahifalarni o'rab turadi
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: "E'lonUz — Buyumlaringiz uchun eng yaxshi joy",
  description: "Ko'chmas mulk, transport, elektronika va boshqa e'lonlarni bepul joylang va toping. Buy · Sell · Online.",
  icons: {
    icon: '/favicon.png',
    apple: '/icon-512.png',
  },
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning - next-themes <html> elementiga class qo'shgani
    // uchun server va mijoz render'i orasidagi tabiiy farqni ogohlantirishdan olib tashlaydi
    <html lang="uz" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
