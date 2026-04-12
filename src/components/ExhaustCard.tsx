import { Volume2, Square } from 'lucide-react';
import { formatPrice } from '../data/pricing';
import type { CarExhaustOption } from '../types';

function SoundWaveAnimation() {
  return (
    <div className="flex items-center gap-[3px] h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-[#FF4500] sound-bar"
          style={{
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

interface ExhaustCardProps {
  option: CarExhaustOption;
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPlaySound: () => void;
}

export default function ExhaustCard({ option, isSelected, isPlaying, onSelect, onPlaySound }: ExhaustCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 min-h-[44px] rounded-xl transition-all duration-300 ${
        isSelected
          ? 'bg-[#FF4500]/10 border border-[#FF4500]/40 shadow-[0_0_24px_rgba(255,69,0,0.12)]'
          : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
              {option.brand}
            </p>
            <span className={`text-[10px] font-semibold tabular-nums ${isSelected ? 'text-[#FF4500]' : 'text-white/30'}`}>
              ${formatPrice(option.price)}
            </span>
          </div>
          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#FF4500]/80' : 'text-white/30'}`}>
            {option.product}
          </p>
          <p className={`text-[9px] mt-1 leading-relaxed ${isSelected ? 'text-white/40' : 'text-white/20'}`}>
            {option.description}
          </p>
        </div>
        <div className="ml-3 flex items-center gap-2 shrink-0">
          {isPlaying && <SoundWaveAnimation />}
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onPlaySound();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onPlaySound();
              }
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
              isPlaying
                ? 'bg-[#FF4500]/20 text-[#FF4500]'
                : 'bg-white/[0.06] text-white/30 hover:bg-white/[0.1] hover:text-white/50'
            }`}
          >
            {isPlaying ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
