import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Shop } from '../types';

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

const shopPinIcon = L.divIcon({
  className: 'leaflet-shop-marker',
  html: `<div class="shop-pin shop-pin-active">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface ShopMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop;
}

export default function ShopMapModal({ isOpen, onClose, shop }: ShopMapModalProps) {
  const fullAddress = `${shop.address}, ${shop.city}, ${shop.state} ${shop.zip}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] overflow-y-auto"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" />

          <div className="relative flex items-center justify-center min-h-full py-8 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-[600px] bg-[#0e0e0e] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#FF4500]" />
                  </div>
                  <h2 className="text-base font-bold text-white">{shop.name}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 pb-4">
                <div className="h-[320px] sm:h-[380px] rounded-xl overflow-hidden border border-white/[0.06] leaflet-dark-map">
                  <MapContainer
                    center={[shop.lat, shop.lng]}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                  >
                    <TileLayer url={DARK_TILE_URL} attribution={DARK_TILE_ATTR} />
                    <Marker position={[shop.lat, shop.lng]} icon={shopPinIcon} />
                  </MapContainer>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{shop.address}</p>
                    <p className="text-xs text-white/40">{shop.city}, {shop.state} {shop.zip}</p>
                  </div>
                </div>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
