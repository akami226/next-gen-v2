import type { TintOption } from '../types';

interface TintCardProps {
  option: TintOption;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TintCard({ option, isSelected, onSelect }: TintCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 min-h-[44px] rounded-xl transition-all duration-300 ${
        isSelected
          ? 'bg-[#FF4500]/10 border border-[#FF4500]/40 shadow-[0_0_24px_rgba(255,69,0,0.12)]'
          : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg border shrink-0 transition-all duration-300 ${
            isSelected ? 'border-[#FF4500]/40' : 'border-white/[0.08]'
          }`}
          style={{
            backgroundColor: option.color ?? '#ffffff',
            opacity: option.color ? 0.3 + option.opacity * 0.7 : 0.15,
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between">
            <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
              {option.name}
            </p>
            <span className={`text-[10px] font-semibold tabular-nums shrink-0 ml-2 ${
              isSelected ? 'text-[#FF4500]' : 'text-white/30'
            }`}>
              {option.vlt}
            </span>
          </div>
          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#FF4500]/70' : 'text-white/30'}`}>
            {option.brand}
          </p>
        </div>
      </div>
    </button>
  );
}
