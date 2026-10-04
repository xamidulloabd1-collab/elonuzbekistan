// components/map/index.js - Xarita komponentlarini faqat brauzerda yuklash
// (Leaflet server tomonda ishlamaydi, shuning uchun ssr: false)
'use client';
import dynamic from 'next/dynamic';

const loading = () => <div className="rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" style={{ height: 220 }} />;

export const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false, loading });
export const ListingsMap = dynamic(() => import('./ListingsMap'), {
  ssr: false,
  loading: () => <div className="bg-gray-100 dark:bg-white/5 animate-pulse" style={{ height: 'calc(100vh - 64px)' }} />,
});
export const ListingLocationMap = dynamic(() => import('./ListingLocationMap'), { ssr: false, loading });
