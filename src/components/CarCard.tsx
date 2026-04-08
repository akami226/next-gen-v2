import type { CarOption } from '../types';

interface CarCardProps {
  car: CarOption;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CarCard({ car, isSelected, onSelect }: CarCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3.5 min-h-[44px] rounded-xl transition-all duration-300 relative group ${
        isSelected
          ? 'bg-[#FF4500]/[0.08] border border-[#FF4500]/40 shadow-[0_0_24px_rgba(255,69,0,0.12)]'
          : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className={`text-xs font-bold tracking-wide transition-colors ${
            isSelected ? 'text-white' : 'text-white/70 group-hover:text-white/90'
          }`}>
            {car.brand}
          </p>
          <p className={`text-[11px] font-semibold mt-0.5 transition-colors ${
            isSelected ? 'text-[#FF4500]' : 'text-[#FF4500]/50 group-hover:text-[#FF4500]/70'
          }`}>
            {car.model}
          </p>
          <p className={`text-[9px] mt-1 uppercase tracking-wider transition-colors ${
            isSelected ? 'text-white/40' : 'text-white/25 group-hover:text-white/35'
          }`}>
            {car.category}
          </p>
        </div>

        {isSelected && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-[8px] font-bold uppercase tracking-widest text-emerald-400">
            Loaded
          </span>
        )}
      </div>

      {isSelected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(255, 69, 0, 0.08), inset 0 0 20px rgba(255, 69, 0, 0.03)',
          }}
        />
      )}
    </button>
  );
}
