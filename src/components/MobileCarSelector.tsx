import { useRef, useEffect } from 'react';
import { Car } from 'lucide-react';
import type { CarOption } from '../types';

interface MobileCarSelectorProps {
  cars: CarOption[];
  selectedCarIndex: number;
  onCarChange: (index: number) => void;
}

export default function MobileCarSelector({ cars, selectedCarIndex, onCarChange }: MobileCarSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[selectedCarIndex] as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCarIndex]);

  return (
    <div className="bg-white/[0.03] border-b border-white/[0.06]">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Car className="w-3.5 h-3.5 text-[#FF4500]" />
        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Vehicle</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2.5 px-4 pb-3 overflow-x-auto hide-scrollbar momentum-scroll snap-x snap-mandatory"
      >
        {cars.map((car, i) => {
          const isSelected = selectedCarIndex === i;
          return (
            <button
              key={car.file}
              onClick={() => onCarChange(i)}
              className={`flex-shrink-0 snap-center px-4 py-3 min-h-[44px] min-w-[140px] rounded-xl transition-all duration-300 ${
                isSelected
                  ? 'bg-[#FF4500]/[0.08] border border-[#FF4500]/40'
                  : 'bg-white/[0.03] border border-white/[0.06]'
              }`}
            >
              <p className={`text-xs font-bold whitespace-nowrap ${
                isSelected ? 'text-white' : 'text-white/60'
              }`}>{car.brand}</p>
              <p className={`text-[10px] mt-0.5 whitespace-nowrap ${
                isSelected ? 'text-[#FF4500]' : 'text-white/30'
              }`}>{car.model}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
