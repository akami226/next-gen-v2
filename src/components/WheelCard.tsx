import type { WheelOption } from '../types';

interface WheelCardProps {
  option: WheelOption;
  isSelected: boolean;
  onSelect: () => void;
}

export default function WheelCard({ option, isSelected, onSelect }: WheelCardProps) {
  return (
    <button
      onClick={onSelect}
      className="group flex flex-col items-center gap-2"
    >
      <div className="relative">
        <div
          className={`w-11 h-11 rounded-full transition-all duration-300 ${
            isSelected ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: option.hex,
            boxShadow: isSelected
              ? '0 0 0 2px #080808, 0 0 0 4px #FF4500, 0 0 12px rgba(255, 69, 0, 0.4)'
              : '0 0 0 1px rgba(255,255,255,0.08)',
          }}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="text-center">
        <p className={`text-[9px] font-semibold leading-tight transition-colors ${
          isSelected ? 'text-white' : 'text-white/50 group-hover:text-white/70'
        }`}>
          {option.name}
        </p>
        <p className={`text-[8px] leading-tight mt-0.5 max-w-[64px] ${
          isSelected ? 'text-white/60' : 'text-white/30'
        }`}>
          {option.brand}
        </p>
      </div>
    </button>
  );
}
