import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; OpenStreetMap &copy; CARTO';

const pinIcon = L.divIcon({
  className: 'leaflet-shop-marker',
  html: `<div class="shop-pin shop-pin-active">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface LeadMapPreviewProps {
  lat: number;
  lng: number;
  label: string;
  city: string;
  onClose: () => void;
  onOpenProfile?: () => void;
}

export default function LeadMapPreview({ lat, lng, label, city, onClose, onOpenProfile }: LeadMapPreviewProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#FF4500]" />
            <span className="text-xs font-semibold text-white/70">{city}</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-2.5 py-1 rounded-lg bg-[#FF4500]/10 border border-[#FF4500]/20 text-[10px] font-semibold text-[#FF4500] hover:bg-[#FF4500]/15 transition-colors"
              >
                Open Full Profile
              </button>
            )}
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all"
              aria-label="Close map preview"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div
          className="h-[200px] rounded-xl overflow-hidden border border-white/[0.06] leaflet-dark-map"
          role="img"
          aria-label={`Map showing location of ${label} in ${city}`}
        >
          <MapContainer
            center={[lat, lng]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              key={isDark ? 'dark' : 'light'}
              url={isDark ? DARK_TILE_URL : LIGHT_TILE_URL}
              attribution={TILE_ATTR}
            />
            <Marker position={[lat, lng]} icon={pinIcon}>
              <Popup className="leaflet-dark-popup">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 map-popup-accent" />
                  <span className="text-xs font-semibold map-popup-name">{label}</span>
                </div>
                <p className="text-[10px] map-popup-location mt-0.5">{city}</p>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </motion.div>
  );
}
