'use client';
// components/map/ListingsMap.jsx - /xarita sahifasi: e'lonlar xaritada narx belgilari bilan
// (yaqin e'lonlar guruhlanadi - leaflet.markercluster)

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { CATEGORY_LABELS, REGION_LABELS, formatPrice } from '@/lib/labels';
import { shortPrice, escapeHtml, TILE_URL, TILE_ATTRIBUTION } from '@/lib/mapUtils';
import { REGION_CENTERS, UZ_CENTER, UZ_ZOOM } from '@/data/regionCenters';

function priceIcon(p) {
  const bg = p.isVip ? '#ffc53d' : '#ffffff';
  const border = p.isVip ? '#e0a400' : '#1565d8';
  return L.divIcon({
    className: '',
    html: `<div class="elonuz-pin" style="background:${bg};border-color:${border}">${p.isVip ? '⭐ ' : ''}${escapeHtml(shortPrice(p.price, p.currency))}</div>`,
    iconSize: [0, 0],
  });
}

function clusterIcon(cluster) {
  const n = cluster.getChildCount();
  const size = n < 10 ? 38 : n < 50 ? 46 : 54;
  return L.divIcon({
    className: '',
    html: `<div class="elonuz-cluster" style="width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px">${n}</div>`,
    iconSize: [0, 0],
  });
}

function popupHtml(p) {
  const img = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:8px" />`
    : '';
  return `<a href="/elon/${encodeURIComponent(p.id)}" style="display:block;width:210px;color:inherit;text-decoration:none">
    ${img}
    <div style="font-weight:800;font-size:15px;color:#1565d8">${escapeHtml(formatPrice(p.price, p.currency))}</div>
    <div style="font-weight:600;font-size:13px;margin:2px 0 4px;line-height:1.3">${escapeHtml(p.title)}</div>
    <div style="font-size:12px;color:#6b7280">📍 ${escapeHtml(REGION_LABELS[p.region] || '')}</div>
    <div style="margin-top:8px;font-weight:700;font-size:13px;color:#1565d8">Batafsil →</div>
  </a>`;
}

/** Nuqtalarni xaritaga chizadi (har safar filtr o'zgarganda qayta chiziladi) */
function ClusterLayer({ points, fitKey }) {
  const map = useMap();
  const groupRef = useRef(null);
  const fittedFor = useRef(null);

  useEffect(() => {
    const group = L.markerClusterGroup({
      iconCreateFunction: clusterIcon,
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
    });
    points.forEach((p) => {
      L.marker([p.lat, p.lng], { icon: priceIcon(p), zIndexOffset: p.isVip ? 1000 : 0 })
        .bindPopup(popupHtml(p), { closeButton: true, maxWidth: 240 })
        .addTo(group);
    });
    map.addLayer(group);
    groupRef.current = group;

    // Yangi filtr bo'yicha birinchi yuklanishda barcha nuqtalarni ko'rsatamiz
    if (points.length && fittedFor.current !== fitKey) {
      fittedFor.current = fitKey;
      map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 14 });
    }
    return () => {
      map.removeLayer(group);
    };
  }, [points, map, fitKey]);

  return null;
}

function FlyToRegion({ region }) {
  const map = useMap();
  useEffect(() => {
    if (region && REGION_CENTERS[region]) map.flyTo(REGION_CENTERS[region], 11, { duration: 0.8 });
  }, [region, map]);
  return null;
}

export default function ListingsMap({ initialCategory = '', initialRegion = '' }) {
  const [category, setCategory] = useState(initialCategory);
  const [region, setRegion] = useState(initialRegion);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (region) qs.set('region', region);
    try {
      const res = await fetch(`/api/listings/map?${qs}`, { cache: 'no-store' });
      const data = await res.json();
      setPoints(data.points || []);
    } catch {
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [category, region]);

  useEffect(() => {
    load();
    // URL'ni ham yangilaymiz (ulashish mumkin bo'lsin)
    const qs = new URLSearchParams();
    if (category) qs.set('category', category);
    if (region) qs.set('region', region);
    window.history.replaceState(null, '', `/xarita${qs.toString() ? `?${qs}` : ''}`);
  }, [load, category, region]);

  return (
    <div className="relative z-0" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Filtrlar paneli */}
      <div className="absolute z-[500] top-3 left-3 right-3 sm:right-auto flex flex-wrap gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field !py-2 !w-auto shadow-md text-sm">
          <option value="">Barcha kategoriyalar</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="input-field !py-2 !w-auto shadow-md text-sm">
          <option value="">Butun O'zbekiston</option>
          {Object.entries(REGION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="self-center text-xs font-semibold bg-white/90 dark:bg-surface-900/90 rounded-lg px-3 py-2 shadow-md">
          {loading ? 'Yuklanmoqda...' : `${points.length} ta e'lon xaritada`}
        </span>
      </div>

      {!loading && points.length === 0 && (
        <div className="absolute z-[500] bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-surface-900 rounded-xl shadow-lg px-4 py-3 text-sm text-center max-w-xs">
          Bu filtr bo'yicha xaritada e'lon yo'q. E'lon joylashda joylashuvni belgilang — u shu yerda chiqadi.
        </div>
      )}

      <MapContainer center={UZ_CENTER} zoom={UZ_ZOOM} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ClusterLayer points={points} fitKey={`${category}|${region}`} />
        {!points.length && <FlyToRegion region={region} />}
      </MapContainer>
    </div>
  );
}
