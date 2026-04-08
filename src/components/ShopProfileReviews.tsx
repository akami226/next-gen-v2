import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronDown, Pen, Image as ImageIcon, Info } from 'lucide-react';
import type { ShopReview } from '../types';
import ReviewRatingBreakdown from './ReviewRatingBreakdown';

type SortOption = 'recent' | 'highest' | 'lowest';

interface ShopProfileReviewsProps {
  reviews: ShopReview[];
  overallRating: number;
  totalReviews: number;
  onWriteReview: () => void;
  isPreview?: boolean;
  previewTooltipVisible?: boolean;
}

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Most Recent',
  highest: 'Highest Rated',
  lowest: 'Lowest Rated',
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ShopProfileReviews({
  reviews,
  overallRating,
  totalReviews,
  onWriteReview,
  isPreview,
  previewTooltipVisible,
}: ShopProfileReviewsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...reviews];
    if (starFilter !== null) {
      result = result.filter((r) => r.rating === starFilter);
    }
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'highest':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating);
        break;
    }
    return result;
  }, [reviews, sortBy, starFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          Customer Reviews
        </h3>
        <div className="relative">
          <button
            onClick={onWriteReview}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 ${
              isPreview
                ? 'bg-[#FF4500]/5 border border-[#FF4500]/10 text-[#FF4500]/40 cursor-not-allowed'
                : 'bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500] hover:bg-[#FF4500]/20'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            Write a Review
          </button>
          {previewTooltipVisible && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-2 z-20"
            >
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1a1a] border border-white/[0.1] shadow-xl whitespace-nowrap">
                <Info className="w-3 h-3 text-[#FF4500]/60" />
                <span className="text-[11px] text-white/50 font-medium">Disabled in preview mode</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ReviewRatingBreakdown
        reviews={reviews}
        overallRating={overallRating}
        totalReviews={totalReviews}
        starFilter={starFilter}
        onStarFilter={setStarFilter}
      />

      <div className="mt-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">
            {starFilter
              ? `${filtered.length} review${filtered.length !== 1 ? 's' : ''} with ${starFilter} star${starFilter !== 1 ? 's' : ''}`
              : `${filtered.length} review${filtered.length !== 1 ? 's' : ''}`}
          </span>
          {starFilter !== null && (
            <button
              onClick={() => setStarFilter(null)}
              className="text-[10px] text-[#FF4500] hover:text-[#FF5722] font-medium transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/50 hover:text-white/70 transition-colors"
          >
            {SORT_LABELS[sortBy]}
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-xl shadow-black/40 overflow-hidden z-20">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                      sortBy === key
                        ? 'text-[#FF4500] bg-[#FF4500]/[0.06]'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-white/25">No reviews match this filter.</p>
          </div>
        ) : (
          filtered.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white/50">
                      {review.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{review.name}</p>
                    <p className="text-[10px] text-white/25">{formatDate(review.date)}</p>
                  </div>
                </div>
                <StarRow rating={review.rating} />
              </div>
              <p className="text-xs text-white/45 leading-relaxed pl-11">{review.comment}</p>

              {review.photos && review.photos.length > 0 && (
                <div className="flex items-center gap-2 mt-3 pl-11">
                  {review.photos.map((photo, pi) => (
                    <button
                      key={pi}
                      onClick={() => setLightboxPhoto(photo)}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/[0.08] hover:border-white/[0.2] transition-all duration-200 group"
                    >
                      <img
                        src={photo}
                        alt={`Review photo ${pi + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxPhoto(null)}
        >
          <img
            src={lightboxPhoto}
            alt="Review photo enlarged"
            className="max-w-[90vw] max-h-[85vh] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </motion.div>
  );
}
