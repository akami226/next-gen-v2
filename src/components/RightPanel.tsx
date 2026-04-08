import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import GlassPanel from './GlassPanel';
import QuoteModal from './QuoteModal';
import ZipSearchBar from './ZipSearchBar';
import ShopMap from './ShopMap';
import ShopCard from './ShopCard';
import type { Shop, BuildConfig } from '../types';
import { fetchZipCoords, haversineDistance } from '../lib/zipGeo';
import type { GeoCoords } from '../lib/zipGeo';

const MAX_DISTANCE_MILES = 50;

interface ShopWithDistance extends Shop {
  distance?: number;
}

interface RightPanelProps {
  shops: Shop[];
  buildConfig: BuildConfig;
  onNavigateShop?: (shopId: string) => void;
}

export default function RightPanel({ shops, buildConfig, onNavigateShop }: RightPanelProps) {
  const [modalShopId, setModalShopId] = useState<string | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchCoords, setSearchCoords] = useState<GeoCoords | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const shopsWithDistance: ShopWithDistance[] = useMemo(() => {
    if (!searchCoords) return shops;
    return shops
      .map((shop) => ({
        ...shop,
        distance: haversineDistance(searchCoords, { lat: shop.lat, lng: shop.lng }),
      }))
      .filter((shop) => shop.distance! <= MAX_DISTANCE_MILES)
      .sort((a, b) => a.distance! - b.distance!);
  }, [shops, searchCoords]);

  useEffect(() => {
    if (selectedShopId && cardRefs.current[selectedShopId]) {
      cardRefs.current[selectedShopId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedShopId]);

  const handleMarkerClick = (shopId: string) => {
    setSelectedShopId((prev) => (prev === shopId ? null : shopId));
  };

  const handleViewProfile = useCallback((shopId: string) => {
    if (onNavigateShop) {
      onNavigateShop(shopId);
    } else {
      window.location.hash = `/shop/${shopId}`;
    }
  }, [onNavigateShop]);

  const handleSearch = useCallback(async (zip: string): Promise<string | null> => {
    setIsSearching(true);
    try {
      const coords = await fetchZipCoords(zip);
      setSearchCoords(coords);
      setHasSearched(true);
      setSelectedShopId(null);
      return null;
    } catch {
      setSearchCoords(null);
      setHasSearched(false);
      return 'Zip code not found. Please enter a valid US zip code';
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSearchCoords(null);
    setHasSearched(false);
    setSelectedShopId(null);
  }, []);

  const modalShop = useMemo(
    () => shops.find((s) => s.id === modalShopId) ?? null,
    [shops, modalShopId]
  );

  const displayShops = hasSearched ? shopsWithDistance : shops;

  return (
    <>
      <div className="w-full h-full overflow-y-auto custom-scrollbar momentum-scroll lg:pl-1">
        <GlassPanel className="p-4 sm:p-5 mb-4" delay={0.15}>
          <h2 className="text-sm font-semibold text-white tracking-wide mb-1">Shop Finder</h2>
          <p className="text-[11px] text-white/30 mb-4">Find certified installation partners near you</p>

          <div className="mb-4">
            <ZipSearchBar
              onSearch={handleSearch}
              onClear={handleClear}
              hasFilter={hasSearched}
              isLoading={isSearching}
            />
          </div>

          <div className="h-[200px] sm:h-48 rounded-xl overflow-hidden border border-white/[0.06] mb-4">
            <ShopMap
              shops={displayShops}
              selectedShopId={selectedShopId}
              onMarkerClick={handleMarkerClick}
              onNavigateShop={handleViewProfile}
              focusCenter={searchCoords}
            />
          </div>

          {hasSearched && displayShops.length === 0 ? (
            <NoResultsCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-white/30">
                  {displayShops.length} shop{displayShops.length !== 1 ? 's' : ''} found
                  {hasSearched && displayShops.length > 0 && (
                    <span className="text-[#FF4500]/50"> within {MAX_DISTANCE_MILES} miles</span>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {displayShops.map((shop) => (
                    <div key={shop.id} ref={(el) => { cardRefs.current[shop.id] = el; }}>
                      <ShopCard
                        shop={shop}
                        isSelected={selectedShopId === shop.id}
                        onSelect={handleMarkerClick}
                        onGetQuote={() => setModalShopId(shop.id)}
                        onViewProfile={handleViewProfile}
                        distance={(shop as ShopWithDistance).distance}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </GlassPanel>
      </div>

      <QuoteModal
        isOpen={modalShopId !== null}
        onClose={() => setModalShopId(null)}
        shop={modalShop}
        buildConfig={buildConfig}
      />
    </>
  );
}

function NoResultsCard() {
  return (
    <div className="py-10 px-6 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-xl bg-[#FF4500]/10 flex items-center justify-center mb-4">
        <MapPin className="w-6 h-6 text-[#FF4500]" />
      </div>
      <h3 className="text-sm font-bold text-white mb-1.5">No shops found in your area</h3>
      <p className="text-[11px] text-white/35 leading-relaxed mb-3">
        We are expanding daily. Check back soon or
      </p>
      <a
        href="#/register"
        className="text-[11px] font-semibold text-[#FF4500] hover:text-[#FF5722] transition-colors"
      >
        Register your shop here
      </a>
    </div>
  );
}
