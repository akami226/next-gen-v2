import { Star } from 'lucide-react';
import type { ShopReview } from '../types';

interface ReviewRatingBreakdownProps {
  reviews: ShopReview[];
  overallRating: number;
  totalReviews: number;
  starFilter: number | null;
  onStarFilter: (star: number | null) => void;
}

export default function ReviewRatingBreakdown({
  reviews,
  overallRating,
  totalReviews,
  starFilter,
  onStarFilter,
}: ReviewRatingBreakdownProps) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxCount = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
      <div className="flex flex-col items-center shrink-0">
        <span className="text-5xl font-black text-white tracking-tight">{overallRating}</span>
        <div className="flex items-center gap-0.5 mt-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.round(overallRating) ? 'text-amber-400 fill-amber-400' : 'text-white/10'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-white/30 mt-1.5">{totalReviews} reviews</span>
      </div>

      <div className="flex-1 w-full space-y-1.5">
        {counts.map(({ star, count }) => {
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const isActive = starFilter === star;
          return (
            <button
              key={star}
              onClick={() => onStarFilter(isActive ? null : star)}
              className={`flex items-center gap-3 w-full group transition-all duration-200 py-1 px-2 rounded-lg -mx-2 ${
                isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
              }`}
            >
              <span className={`text-xs font-medium w-3 text-right ${isActive ? 'text-amber-400' : 'text-white/40'}`}>
                {star}
              </span>
              <Star className={`w-3 h-3 shrink-0 ${isActive ? 'text-amber-400 fill-amber-400' : 'text-white/20 fill-white/20'}`} />
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-amber-400' : 'bg-amber-400/60'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={`text-[11px] w-6 text-right ${isActive ? 'text-white/70' : 'text-white/25'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
