import { Play, Square } from 'lucide-react';
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
  isActive: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}

export default function ExhaustCard({ option, isActive, isPlaying, onToggle }: ExhaustCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left px-4 py-3 min-h-[44px] rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-[#FF4500]/10 border border-[#FF4500]/40 shadow-[0_0_24px_rgba(255,69,0,0.12)]'
          : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-white/60'}`}>
            {option.brand}
          </p>
          <p className={`text-[10px] mt-0.5 ${isActive ? 'text-[#FF4500]/80' : 'text-white/30'}`}>
            {option.product}
          </p>
          <p className={`text-[9px] mt-1 leading-relaxed ${isActive ? 'text-white/40' : 'text-white/20'}`}>
            {option.description}
          </p>
        </div>
        <div className="ml-3 flex items-center gap-2 shrink-0">
          {isActive && isPlaying && <SoundWaveAnimation />}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            isActive
              ? 'bg-[#FF4500]/20 text-[#FF4500]'
              : 'bg-white/[0.06] text-white/30 hover:bg-white/[0.1] hover:text-white/50'
          }`}>
            {isActive && isPlaying ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current ml-0.5" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
