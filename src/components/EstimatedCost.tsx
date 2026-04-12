import { useEffect, useRef, useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BuildPriceBreakdown } from '../data/pricing';
import { formatPrice } from '../data/pricing';

interface EstimatedCostProps {
  breakdown: BuildPriceBreakdown;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current;
    const diff = value - start;
    const duration = 400;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prev.current = value;
  }, [value]);

  return <>{formatPrice(display)}</>;
}

const ITEMS: { key: keyof Omit<BuildPriceBreakdown, 'total'>; label: string }[] = [
  { key: 'wrap', label: 'Wrap' },
  { key: 'wheels', label: 'Wheels' },
  { key: 'tint', label: 'Tint' },
  { key: 'exhaust', label: 'Exhaust' },
  { key: 'suspension', label: 'Suspension' },
];

export default function EstimatedCost({ breakdown }: EstimatedCostProps) {
  const [expanded, setExpanded] = useState(true);

  const hasPrice = breakdown.total.high > 0;
  if (!hasPrice) return null;

  return (
    <div className="bg-[#111111] dark:bg-[#111111] light:bg-[#e8e8ea] backdrop-blur-md border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] rounded-2xl">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 gap-3"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FF4500]/10 flex items-center justify-center shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-[#FF4500]" />
          </div>
          <span className="text-[11px] font-semibold text-white/50 dark:text-white/50 light:text-black/50 uppercase tracking-wider">
            Est. Cost
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-[#FF4500] whitespace-nowrap">
            $<AnimatedNumber value={breakdown.total.low} /> &ndash; $<AnimatedNumber value={breakdown.total.high} />
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-white/30 dark:text-white/30 light:text-black/30" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-white/30 dark:text-white/30 light:text-black/30" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1.5">
              <div className="h-px bg-white/[0.06] dark:bg-white/[0.06] light:bg-black/[0.06] mb-2" />
              {ITEMS.map(({ key, label }) => {
                const range = breakdown[key];
                if (range.high === 0) return null;
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[10px] text-white/35 dark:text-white/35 light:text-black/40">{label}</span>
                    <span className="text-[10px] text-white/60 dark:text-white/60 light:text-black/60 font-medium tabular-nums">
                      ${formatPrice(range.low)} &ndash; ${formatPrice(range.high)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
