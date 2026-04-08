import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Upload, Loader2, CheckCircle, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { ShopReview } from '../types';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopName: string;
  user: User | null;
  onNavigateAuth: () => void;
  onReviewSubmitted: (review: ShopReview) => void;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  shopId,
  shopName,
  user,
  onNavigateAuth,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const displayName =
        user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Anonymous';

      const { data, error: dbError } = await supabase
        .from('shop_reviews')
        .insert({
          shop_id: shopId,
          user_id: user!.id,
          display_name: displayName,
          rating,
          comment: comment.trim(),
          photos: [],
        })
        .select()
        .maybeSingle();

      if (dbError) {
        if (dbError.code === '23505') {
          setError('You have already reviewed this shop');
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }

      if (data) {
        onReviewSubmitted({
          id: data.id,
          name: displayName,
          rating: data.rating,
          date: data.created_at,
          comment: data.comment,
          photos: data.photos || [],
        });
      }

      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center py-8 px-4 overflow-y-auto"
          onClick={handleClose}
        >
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0e0e0e] light:bg-white border border-white/[0.08] light:border-gray-200 rounded-2xl shadow-2xl shadow-black/50 light:shadow-xl light:shadow-black/10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">
                {!user ? 'Sign In Required' : success ? 'Review Submitted' : 'Write a Review'}
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {!user ? (
                <NotLoggedIn onNavigateAuth={() => { handleClose(); onNavigateAuth(); }} shopName={shopName} />
              ) : success ? (
                <SuccessScreen onClose={handleClose} />
              ) : (
                <ReviewForm
                  shopName={shopName}
                  displayRating={displayRating}
                  comment={comment}
                  error={error}
                  submitting={submitting}
                  onSetRating={setRating}
                  onSetHoverRating={setHoverRating}
                  onSetComment={setComment}
                  onSubmit={handleSubmit}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NotLoggedIn({ onNavigateAuth, shopName }: { onNavigateAuth: () => void; shopName: string }) {
  return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
        <LogIn className="w-6 h-6 text-white/30" />
      </div>
      <p className="text-sm text-white/60 mb-1">
        Sign in to leave a review for
      </p>
      <p className="text-sm font-semibold text-white mb-5">{shopName}</p>
      <button
        onClick={onNavigateAuth}
        className="px-6 py-3 bg-[#FF4500] hover:bg-[#FF5722] text-white text-sm font-bold rounded-xl transition-colors duration-200 shadow-lg shadow-[#FF4500]/20"
      >
        Sign In or Create Account
      </button>
    </div>
  );
}

function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircle className="w-7 h-7 text-emerald-400" />
      </motion.div>
      <p className="text-sm font-semibold text-white mb-1">Thank you for your review!</p>
      <p className="text-xs text-white/40 mb-5">Your feedback helps other car enthusiasts.</p>
      <button
        onClick={onClose}
        className="px-6 py-3 bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-semibold rounded-xl hover:bg-white/[0.1] transition-colors"
      >
        Done
      </button>
    </div>
  );
}

function ReviewForm({
  shopName,
  displayRating,
  comment,
  error,
  submitting,
  onSetRating,
  onSetHoverRating,
  onSetComment,
  onSubmit,
}: {
  shopName: string;
  displayRating: number;
  comment: string;
  error: string;
  submitting: boolean;
  onSetRating: (r: number) => void;
  onSetHoverRating: (r: number) => void;
  onSetComment: (c: string) => void;
  onSubmit: () => void;
}) {
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-white/40 mb-1">Reviewing</p>
        <p className="text-sm font-semibold text-white">{shopName}</p>
      </div>

      <div>
        <p className="text-xs text-white/40 mb-3">Your Rating</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => onSetHoverRating(i + 1)}
                onMouseLeave={() => onSetHoverRating(0)}
                onClick={() => onSetRating(i + 1)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 transition-colors duration-150 ${
                    i < displayRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-white/10 hover:text-white/20'
                  }`}
                />
              </button>
            ))}
          </div>
          {displayRating > 0 && (
            <span className="text-xs font-medium text-amber-400/80">
              {ratingLabels[displayRating]}
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-white/40">Your Review</p>
          <span className="text-[10px] text-white/20">{comment.length}/500</span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => {
            if (e.target.value.length <= 500) onSetComment(e.target.value);
          }}
          placeholder="Share your experience with this shop..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none resize-none transition-all duration-200 focus:border-[#FF4500]/40 focus:shadow-[0_0_12px_rgba(255,69,0,0.06)]"
        />
      </div>

      <div>
        <p className="text-xs text-white/40 mb-2">Attach Photos (optional)</p>
        <label className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-dashed border-white/[0.1] rounded-xl cursor-pointer hover:border-white/[0.2] transition-colors group">
          <Upload className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
          <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
            Choose photos...
          </span>
          <input type="file" accept="image/*" multiple className="hidden" />
        </label>
        <p className="text-[10px] text-white/15 mt-1">JPG, PNG up to 5MB each</p>
      </div>

      {error && (
        <p className="text-xs text-red-400/80">{error}</p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="w-full py-3.5 bg-[#FF4500] hover:bg-[#FF5722] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors duration-200 shadow-lg shadow-[#FF4500]/20 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </button>
    </div>
  );
}
