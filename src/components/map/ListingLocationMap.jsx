'use client';
// components/map/ListingLocationMap.jsx - E'lon sahifasidagi kichik xarita
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TILE_URL, TILE_ATTRIBUTION } from '@/lib/mapUtils';

const pinIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:34px;line-height:34px;transform:translate(-50%,-100%);filter:drop-shadow(0 2px 2px rgba(0,0,0,.35))">📍</div>',
  iconSize: [0, 0],
});

export default function ListingLocationMap({ latitude, longitude }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 relative z-0" style={{ height: 220 }}>
      <MapContainer center={[latitude, longitude]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <Marker position={[latitude, longitude]} icon={pinIcon} />
      </MapContainer>
    </div>
  );
}
