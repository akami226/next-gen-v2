import { MapPin, Star, Phone, BadgeCheck, Navigation, ExternalLink, Map, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Shop } from '../types';
import { getInitials } from './ShopInitials';
import { useTheme } from '../hooks/useTheme';

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; OpenStreetMap &copy; CARTO';

const shopPinIcon = L.divIcon({
  className: 'leaflet-shop-marker',
  html: `<div class="shop-pin shop-pin-active">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface ShopCardProps {
  shop: Shop;
  isSelected: boolean;
  onSelect: (shopId: string) => void;
  onGetQuote: () => void;
  onViewProfile: (shopId: string) => void;
  distance?: number;
  showMapPreview?: boolean;
  onToggleMapPreview?: (shopId: string) => void;
}

export default function ShopCard({ shop, isSelected, onSelect, onGetQuote, onViewProfile, distance, showMapPreview, onToggleMapPreview }: ShopCardProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => onSelect(shop.id)}
      className={`rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-[#FF4500]/[0.08] border-[#FF4500]/30 shadow-lg shadow-[#FF4500]/5'
          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/[0.08] shrink-0">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#0e0e0e] flex items-center justify-center">
                <span className="text-[9px] font-black text-[#FF4500] tracking-tighter">
                  {getInitials(shop.name)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className={`text-sm font-semibold truncate transition-colors ${
                isSelected ? 'text-[#FF4500]' : 'text-white'
              }`}>
                {shop.name}
              </h3>
              {shop.verified && (
                <BadgeCheck className="w-3.5 h-3.5 text-[#FF4500] shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-white/30 shrink-0" />
              <p className="text-[11px] text-white/40 truncate">
                {shop.address}, {shop.city}, {shop.state} {shop.zip}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 fill-[#FF4500]/80 text-[#FF4500]/80" />
            <span className="text-[11px] font-medium text-white/60">{shop.rating}</span>
            <span className="text-[10px] text-white/25">({shop.reviews})</span>
          </div>
        </div>

        {distance !== undefined && (
          <div className="flex items-center gap-1.5 mb-2">
            <Navigation className="w-3 h-3 text-[#FF4500]/60 shrink-0" />
            <span className="text-[11px] font-medium text-[#FF4500]/70">
              {Math.round(distance)} {Math.round(distance) === 1 ? 'mile' : 'miles'} away
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 mb-2.5">
          <Phone className="w-3 h-3 text-white/25 shrink-0" />
          <span className="text-[11px] text-white/35">{shop.phone}</span>
        </div>

        <p className="text-[11px] text-white/35 leading-relaxed mb-3 line-clamp-2">{shop.bio}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {shop.specialties.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.06] text-[10px] text-white/45 font-medium"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGetQuote();
            }}
            className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-[#FF4500] text-white text-xs font-semibold hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20"
          >
            Get Quote
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleMapPreview) onToggleMapPreview(shop.id);
            }}
            className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5 ${
              showMapPreview
                ? 'bg-[#FF4500]/10 border border-[#FF4500]/30 text-[#FF4500]'
                : 'bg-white/[0.06] border border-white/[0.08] text-white/50 hover:bg-white/[0.1] hover:text-white/80'
            }`}
          >
            {showMapPreview ? <X className="w-3 h-3" /> : <Map className="w-3 h-3" />}
            {showMapPreview ? 'Close' : 'Location'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMapPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="h-[180px] rounded-xl overflow-hidden border border-white/[0.08] leaflet-dark-map">
                <MapContainer
                  center={[shop.lat, shop.lng]}
                  zoom={14}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    key={isDark ? 'dark' : 'light'}
                    url={isDark ? DARK_TILE_URL : LIGHT_TILE_URL}
                    attribution={TILE_ATTR}
                  />
                  <Marker position={[shop.lat, shop.lng]} icon={shopPinIcon}>
                    <Popup className="leaflet-dark-popup">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 map-popup-accent" />
                        <span className="text-xs font-semibold map-popup-name">{shop.name}</span>
                      </div>
                      <p className="text-[10px] map-popup-location mt-0.5">{shop.city}, {shop.state}</p>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(shop.id);
                }}
                className="w-full mt-3 min-h-[40px] py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-xs font-semibold hover:bg-white/[0.1] hover:text-white hover:border-white/[0.12] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Full Shop Page
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
