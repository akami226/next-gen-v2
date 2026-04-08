import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Reply, Send, X, ChevronDown } from 'lucide-react';
import type { Shop } from '../../types';
import { getDemoReviews, type DemoReview } from '../../data/dashboardDemo';

type SortOption = 'recent' | 'highest' | 'lowest';
const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Most Recent',
  highest: 'Highest Rated',
  lowest: 'Lowest Rated',
};

export default function DashboardReviews({ shop }: { shop: Shop }) {
  const [reviews, setReviews] = useState<DemoReview[]>(() => getDemoReviews(shop));
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const sorted = useMemo(() => {
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

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, reply: replyText.trim(), reply_date: new Date().toISOString().split('T')[0] }
          : r
      )
    );
    setReplyText('');
    setReplyingTo(null);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white">Reviews</h2>
        <p className="text-sm text-white/40 mt-1">
          {reviews.length} reviews &middot; {avgRating} average rating
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-2 mb-6"
      >
        <div className="flex items-center gap-1.5">
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              onClick={() => setStarFilter(starFilter === s ? null : s)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                starFilter === s
                  ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/30 hover:text-white/50'
              }`}
            >
              <Star className={`w-2.5 h-2.5 ${starFilter === s ? 'fill-amber-400' : ''}`} />
              {s}
            </button>
          ))}
          {starFilter !== null && (
            <button
              onClick={() => setStarFilter(null)}
              className="text-[10px] text-[#FF4500] hover:text-[#FF5722] font-medium ml-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/50 hover:text-white/70 transition-colors"
          >
            {SORT_LABELS[sortBy]}
            <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1a] border border-white/[0.1] rounded-xl shadow-xl shadow-black/40 overflow-hidden z-20">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setSortOpen(false); }}
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
      </motion.div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-white/25">No reviews match this filter.</p>
          </div>
        ) : (
          sorted.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.03 }}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white/50">
                      {review.name.split(' ').map((w) => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{review.name}</p>
                    <p className="text-[10px] text-white/25">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3 h-3 ${
                        si < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-white/45 leading-relaxed pl-11 mb-3">{review.comment}</p>

              {review.photos && review.photos.length > 0 && (
                <div className="flex items-center gap-2 pl-11 mb-3">
                  {review.photos.map((photo, pi) => (
                    <div
                      key={pi}
                      className="w-14 h-14 rounded-lg overflow-hidden border border-white/[0.08]"
                    >
                      <img src={photo} alt={`Review photo ${pi + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {review.reply ? (
                <div className="ml-11 mt-2 p-3 rounded-xl bg-[#FF4500]/[0.04] border border-[#FF4500]/10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Reply className="w-3 h-3 text-[#FF4500]/50" />
                    <span className="text-[10px] font-semibold text-[#FF4500]/60">Owner Reply</span>
                    {review.reply_date && (
                      <span className="text-[10px] text-white/20 ml-1">
                        {new Date(review.reply_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed">{review.reply}</p>
                </div>
              ) : (
                <div className="pl-11">
                  <AnimatePresence>
                    {replyingTo === review.id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            rows={2}
                            className="flex-1 px-3 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-xs text-white placeholder:text-white/20 outline-none resize-none focus:border-[#FF4500]/40 transition-colors"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleReply(review.id)}
                              className="w-8 h-8 rounded-lg bg-[#FF4500] hover:bg-[#FF5722] flex items-center justify-center transition-colors"
                            >
                              <Send className="w-3.5 h-3.5 text-white" />
                            </button>
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                            >
                              <X className="w-3.5 h-3.5 text-white/40" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-white/25 hover:text-white/50 transition-colors mt-1"
                      >
                        <Reply className="w-3 h-3" />
                        Reply
                      </button>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
