'use client';
// components/RegionMap.jsx - O'zbekiston viloyatlari xaritasi orqali vizual qidirish
//
// Xarita manbai: @svg-maps/uzbekistan (CC-BY 4.0, VictorCazanave/svg-maps).
// Har bir viloyatga bosilganda /elonlar?region=... sahifasiga o'tkazadi.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Map as MapIcon, X } from 'lucide-react';
import { UZBEKISTAN_REGIONS, UZBEKISTAN_MAP_VIEWBOX } from '@/data/uzbekistanRegions';
import { REGION_LABELS } from '@/lib/labels';

export default function RegionMap({ currentRegion }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

  function handleSelect(region) {
    if (!region) return;
    router.push(`/elonlar?region=${region}`);
    setOpen(false);
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2"
      >
        <MapIcon size={16} />
        Xarita orqali qidirish
      </button>

      {open && (
        <div className="card p-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-sm">
              {hovered ? REGION_LABELS[hovered] : "Hududni tanlash uchun xaritada bosing"}
            </p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X size={18} />
            </button>
          </div>

          <svg viewBox={UZBEKISTAN_MAP_VIEWBOX} className="w-full h-auto max-h-[420px]">
            {UZBEKISTAN_REGIONS.map(({ id, region, path }) => {
              if (!region) {
                // Orol dengizi - faqat dekorativ, bosilmaydi
                return <path key={id} d={path} className="fill-sky-100 dark:fill-sky-950" />;
              }
              const isActive = region === currentRegion;
              const isHovered = region === hovered;
              return (
                <path
                  key={id}
                  d={path}
                  onClick={() => handleSelect(region)}
                  onMouseEnter={() => setHovered(region)}
                  onMouseLeave={() => setHovered(null)}
                  className={`cursor-pointer stroke-white dark:stroke-surface-950 transition-colors ${
                    isActive
                      ? 'fill-brand-500'
                      : isHovered
                      ? 'fill-brand-300 dark:fill-brand-500/70'
                      : 'fill-gray-200 dark:fill-surface-700 hover:fill-brand-200'
                  }`}
                  strokeWidth="1.5"
                >
                  <title>{REGION_LABELS[region]}</title>
                </path>
              );
            })}
          </svg>

          <p className="text-[11px] text-gray-300 dark:text-gray-600 text-right mt-1">
            Xarita manbai: svg-maps.com (CC-BY 4.0)
          </p>
        </div>
      )}
    </div>
  );
}
