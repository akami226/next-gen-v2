import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import type { Shop } from '../types';
import { useTheme } from '../hooks/useTheme';

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

function createShopIcon(isSelected: boolean) {
  return L.divIcon({
    className: 'leaflet-shop-marker',
    html: `<div class="shop-pin ${isSelected ? 'shop-pin-active' : ''}">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

interface MapControllerProps {
  shops: Shop[];
  focusCenter?: { lat: number; lng: number } | null;
}

function ThemeTileSwapper({ isDark }: { isDark: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    const url = isDark ? DARK_TILE_URL : LIGHT_TILE_URL;
    layerRef.current = L.tileLayer(url, { attribution: TILE_ATTR });
    layerRef.current.addTo(map);
  }, [isDark, map]);

  return null;
}

function MapController({ shops, focusCenter }: MapControllerProps) {
  const map = useMap();
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (!initialFitDone.current && shops.length > 0) {
      const bounds = L.latLngBounds(shops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
      initialFitDone.current = true;
    }
  }, [shops, map]);

  useEffect(() => {
    if (focusCenter && shops.length > 0) {
      const bounds = L.latLngBounds([
        [focusCenter.lat, focusCenter.lng],
        ...shops.map(s => [s.lat, s.lng] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    } else if (focusCenter) {
      map.setView([focusCenter.lat, focusCenter.lng], 11);
    } else if (shops.length > 0) {
      const bounds = L.latLngBounds(shops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [focusCenter, shops, map]);

  return null;
}

interface ShopMapProps {
  shops: Shop[];
  selectedShopId: string | null;
  onMarkerClick: (shopId: string) => void;
  onNavigateShop?: (shopId: string) => void;
  focusCenter?: { lat: number; lng: number } | null;
}

export default function ShopMap({ shops, selectedShopId, onMarkerClick, onNavigateShop, focusCenter }: ShopMapProps) {
  const { isDark } = useTheme();
  const center: [number, number] = shops.length > 0
    ? [shops.reduce((s, sh) => s + sh.lat, 0) / shops.length, shops.reduce((s, sh) => s + sh.lng, 0) / shops.length]
    : focusCenter ? [focusCenter.lat, focusCenter.lng] : [34.0522, -118.2437];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden leaflet-dark-map">
      <MapContainer
        center={center}
        zoom={11}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={isDark ? DARK_TILE_URL : LIGHT_TILE_URL} attribution={TILE_ATTR} />
        <ThemeTileSwapper isDark={isDark} />
        <MapController shops={shops} focusCenter={focusCenter} />
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.lat, shop.lng]}
            icon={createShopIcon(selectedShopId === shop.id)}
            eventHandlers={{
              click: () => {
                onMarkerClick(shop.id);
                if (onNavigateShop) onNavigateShop(shop.id);
              },
            }}
          >
            <Popup className="leaflet-dark-popup">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 map-popup-accent" />
                <span className="text-xs font-semibold map-popup-name">{shop.name}</span>
              </div>
              <p className="text-[10px] map-popup-location mt-0.5">{shop.city}, {shop.state}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
