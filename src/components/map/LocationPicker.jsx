'use client';
// components/map/LocationPicker.jsx - E'lon formasidagi xarita: joylashuvni belgilash
// (xaritaga bosish, nuqtani sudrash yoki "Joylashuvimni aniqlash")

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILE_URL, TILE_ATTRIBUTION } from '@/lib/mapUtils';
import { REGION_CENTERS, UZ_CENTER, UZ_ZOOM } from '@/data/regionCenters';

const pinIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:34px;line-height:34px;transform:translate(-50%,-100%);filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">📍</div>',
  iconSize: [0, 0],
});

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.8 });
  }, [center?.[0], center?.[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function LocationPicker({ latitude, longitude, region, onChange }) {
  const hasPoint = latitude !== null && latitude !== undefined && latitude !== '';
  const [locating, setLocating] = useState(false);
  const [target, setTarget] = useState(null); // { center, zoom }

  // Hudud tanlanganda (nuqta hali qo'yilmagan bo'lsa) xarita o'sha hududga yaqinlashadi
  useEffect(() => {
    if (!hasPoint && region && REGION_CENTERS[region]) setTarget({ center: REGION_CENTERS[region], zoom: 11 });
  }, [region]); // eslint-disable-line react-hooks/exhaustive-deps

  const initial = useMemo(
    () => (hasPoint ? { center: [Number(latitude), Number(longitude)], zoom: 15 } : region && REGION_CENTERS[region] ? { center: REGION_CENTERS[region], zoom: 11 } : { center: UZ_CENTER, zoom: UZ_ZOOM }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function pick(lat, lng) {
    onChange(Math.round(lat * 1e5) / 1e5, Math.round(lng * 1e5) / 1e5);
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pick(pos.coords.latitude, pos.coords.longitude);
        setTarget({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 16 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 relative z-0" style={{ height: 280 }}>
        <MapContainer center={initial.center} zoom={initial.zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickHandler onPick={pick} />
          {target && <FlyTo center={target.center} zoom={target.zoom} />}
          {hasPoint && (
            <Marker
              position={[Number(latitude), Number(longitude)]}
              icon={pinIcon}
              draggable
              eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); pick(p.lat, p.lng); } }}
            />
          )}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
        <button type="button" onClick={locateMe} disabled={locating} className="font-semibold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50">
          {locating ? 'Aniqlanmoqda...' : '📍 Joylashuvimni aniqlash'}
        </button>
        {hasPoint ? (
          <button type="button" onClick={() => onChange(null, null)} className="text-gray-400 hover:text-red-500">
            Belgini olib tashlash
          </button>
        ) : (
          <span className="text-gray-400">yoki xaritada kerakli joyga bosing</span>
        )}
      </div>
    </div>
  );
}
