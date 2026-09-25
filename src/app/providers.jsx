'use client';
// app/providers.jsx - Butun ilovani o'rab turadigan "client" provayderlar:
// Dark/Light tema (next-themes) va Toast bildirishnomalar (react-hot-toast)

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <FavoritesProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #111827)',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
              },
            }}
          />
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
