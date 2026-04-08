import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquareQuote, MapPin, Eye, X, Info } from 'lucide-react';
import type { Shop, BuildConfig, ShopReview } from '../types';
import type { User } from '@supabase/supabase-js';
import { useSEO } from '../hooks/useSEO';
import { useShopSchema } from '../components/StructuredData';
import ShopProfileHero from '../components/ShopProfileHero';
import ShopProfileDetails from '../components/ShopProfileDetails';
import ShopProfileGallery from '../components/ShopProfileGallery';
import ShopProfileReviews from '../components/ShopProfileReviews';
import QuoteModal from '../components/QuoteModal';
import ShopMapModal from '../components/ShopMapModal';
import WriteReviewModal from '../components/WriteReviewModal';

interface ShopProfilePageProps {
  shop: Shop;
  buildConfig: BuildConfig;
  user: User | null;
  onBack: () => void;
  onNavigateAuth: () => void;
  isPreview?: boolean;
  onExitPreview?: () => void;
}

export default function ShopProfilePage({ shop, buildConfig, user, onBack, onNavigateAuth, isPreview, onExitPreview }: ShopProfilePageProps) {
  const shopSeo = useMemo(() => ({
    title: `${shop.name} - Car Mod Shop | NextGen Mods`,
    description: `${shop.name} in ${shop.city}, ${shop.state}. ${shop.specialties.slice(0, 3).join(', ')} and more. Read reviews and get a free quote.`,
    keywords: `${shop.name}, car mod shop, ${shop.city} ${shop.state}, ${shop.specialties.join(', ')}`,
    ogType: 'business.business' as const,
  }), [shop.name, shop.city, shop.state, shop.specialties]);
  useSEO(shopSeo);
  useShopSchema(shop);

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<ShopReview[]>(shop.customerReviews);
  const [tooltip, setTooltip] = useState<'quote' | 'review' | null>(null);

  const handleReviewSubmitted = useCallback((review: ShopReview) => {
    setLocalReviews((prev) => [review, ...prev]);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] light:bg-[#f0f0f2] font-sans antialiased">
      {isPreview && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 z-50 bg-[#0e0e0e]/95 backdrop-blur-lg border-b border-[#FF4500]/20"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center shrink-0">
                <Eye className="w-3.5 h-3.5 text-[#FF4500]" />
              </div>
              <p className="text-xs text-white/60 font-medium truncate">
                You are previewing your shop as a customer sees it
              </p>
            </div>
            <button
              onClick={onExitPreview}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.1] transition-all shrink-0"
            >
              <X className="w-3 h-3" />
              Exit Preview
            </button>
          </div>
        </motion.div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!isPreview && (
          <motion.button
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors mb-5 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </motion.button>
        )}

        <ShopProfileHero shop={shop} />

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                if (isPreview) {
                  setTooltip('quote');
                  setTimeout(() => setTooltip(null), 2000);
                } else {
                  setQuoteOpen(true);
                }
              }}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                isPreview
                  ? 'bg-[#FF4500]/40 text-white/50 cursor-not-allowed'
                  : 'bg-[#FF4500] text-white hover:bg-[#FF5722] active:scale-[0.98] shadow-lg shadow-[#FF4500]/20'
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              Get Quote
            </motion.button>
            {tooltip === 'quote' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20"
              >
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.1] shadow-xl whitespace-nowrap">
                  <Info className="w-3 h-3 text-[#FF4500]/60" />
                  <span className="text-[11px] text-white/50 font-medium">Disabled in preview mode</span>
                </div>
              </motion.div>
            )}
          </div>
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            onClick={() => setMapOpen(true)}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-semibold hover:bg-white/[0.1] hover:text-white active:scale-[0.98] transition-all duration-200"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </motion.button>
        </div>

        <div className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 mb-4"
          >
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {shop.specialties.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg bg-[#FF4500]/[0.08] border border-[#FF4500]/20 text-xs text-[#FF4500] font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5 mb-4"
          >
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">About</h3>
            <p className="text-sm text-white/50 leading-relaxed">{shop.bio}</p>
          </motion.div>
        </div>

        <div className="mt-4">
          <ShopProfileDetails shop={shop} />
        </div>

        <div className="mt-4">
          <ShopProfileGallery gallery={shop.gallery} shopName={shop.name} />
        </div>

        <div className="mt-4 pb-8">
          <ShopProfileReviews
            reviews={localReviews}
            overallRating={shop.rating}
            totalReviews={shop.reviews}
            onWriteReview={() => {
              if (isPreview) {
                setTooltip('review');
                setTimeout(() => setTooltip(null), 2000);
              } else {
                setReviewModalOpen(true);
              }
            }}
            isPreview={isPreview}
            previewTooltipVisible={tooltip === 'review'}
          />
        </div>
      </div>

      {!isPreview && (
        <>
          <QuoteModal
            isOpen={quoteOpen}
            onClose={() => setQuoteOpen(false)}
            shop={shop}
            buildConfig={buildConfig}
          />

          <WriteReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            shopId={shop.id}
            shopName={shop.name}
            user={user}
            onNavigateAuth={onNavigateAuth}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </>
      )}

      <ShopMapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        shop={shop}
      />
    </div>
  );
}
