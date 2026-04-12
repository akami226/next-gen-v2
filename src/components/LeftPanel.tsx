import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { CircleDot, Disc3, ArrowDownUp, AudioLines, Car, RotateCcw, StopCircle, PanelTop } from 'lucide-react';
import GlassPanel from './GlassPanel';
import SectionLabel from './SectionLabel';
import CarCard from './CarCard';
import ExhaustCard from './ExhaustCard';
import TintCard from './TintCard';
import type { Wrap, CarOption, TintOption } from '../types';
import { WHEEL_OPTIONS } from '../data/wheelOptions';

function getSuspensionLabel(value: number): { text: string; brand: string; color: 'orange' | 'gray' } {
  if (value <= -0.2) return { text: 'SLAMMED', brand: 'Air Lift Performance 3P', color: 'orange' };
  if (value <= -0.05) return { text: 'LOWERED', brand: 'KW V3 Coilovers', color: 'orange' };
  if (value <= 0.04) return { text: 'STOCK RIDE HEIGHT', brand: '', color: 'gray' };
  if (value <= 0.19) return { text: 'RAISED', brand: 'KW V3 Coilovers', color: 'gray' };
  return { text: 'LIFTED', brand: 'ReadyLIFT 4 inch Kit', color: 'orange' };
}

interface LeftPanelProps {
  cars: CarOption[];
  selectedCarIndex: number;
  onCarChange: (index: number) => void;
  wraps: Wrap[];
  selectedWrap: number;
  onWrapChange: (index: number) => void;
  suspensionHeight: number;
  onSuspensionChange: (value: number) => void;
  tintOptions: TintOption[];
  selectedTint: number;
  onTintChange: (index: number) => void;
  selectedWheelIndex: number;
  onWheelChange: (index: number) => void;
  selectedExhaustIndex: number | null;
  onExhaustChange: (index: number | null) => void;
}

export default function LeftPanel({
  cars,
  selectedCarIndex,
  onCarChange,
  wraps,
  selectedWrap,
  onWrapChange,
  suspensionHeight,
  onSuspensionChange,
  tintOptions,
  selectedTint,
  onTintChange,
  selectedWheelIndex,
  onWheelChange,
  selectedExhaustIndex,
  onExhaustChange,
}: LeftPanelProps) {
  const [playingExhaustIndex, setPlayingExhaustIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const handleWheelSelect = useCallback((index: number) => {
    onWheelChange(index);
  }, [onWheelChange]);

  const exhaustOptions = cars[selectedCarIndex].exhaustOptions;

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingExhaustIndex(null);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    stopAudio();
  }, [selectedCarIndex, stopAudio]);

  const handleExhaustSelect = useCallback((index: number) => {
    onExhaustChange(selectedExhaustIndex === index ? null : index);
  }, [selectedExhaustIndex, onExhaustChange]);

  const handlePlaySound = useCallback((index: number) => {
    if (playingExhaustIndex === index && isPlaying) {
      stopAudio();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(exhaustOptions[index].file);
    audio.loop = true;
    audioRef.current = audio;
    setPlayingExhaustIndex(index);
    setIsPlaying(true);

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.play().catch(() => {
      setIsPlaying(false);
      setPlayingExhaustIndex(null);
    });
  }, [playingExhaustIndex, isPlaying, exhaustOptions, stopAudio]);

  const label = useMemo(() => getSuspensionLabel(suspensionHeight), [suspensionHeight]);

  const fillPercent = ((suspensionHeight - (-0.3)) / (0.3 - (-0.3))) * 100;

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar momentum-scroll pr-1">
      <GlassPanel className="p-5 mb-4" delay={0.05}>
        <div className="flex items-center gap-2.5 mb-4">
          <Car className="w-4 h-4 text-[#FF4500]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Select Your Vehicle</h2>
        </div>
        <div className="space-y-2">
          {cars.map((car, i) => (
            <CarCard
              key={car.file}
              car={car}
              isSelected={selectedCarIndex === i}
              onSelect={() => onCarChange(i)}
            />
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 mb-4" delay={0.1}>
        <div className="flex items-center gap-2.5 mb-5">
          <CircleDot className="w-4 h-4 text-[#FF4500]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Wraps</h2>
        </div>

        <SectionLabel label="Color" />
        <div className="grid grid-cols-4 gap-3">
          {wraps.map((wrap, i) => (
            <button
              key={i}
              onClick={() => onWrapChange(i)}
              className="group flex flex-col items-center gap-2"
            >
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-full transition-all duration-300 ${
                    selectedWrap === i
                      ? 'scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: wrap.hex,
                    boxShadow: selectedWrap === i
                      ? `0 0 0 2px var(--bg-body), 0 0 0 4px #FF4500, 0 0 12px rgba(255, 69, 0, 0.4)`
                      : `0 0 0 1px rgba(255,255,255,0.08)`,
                  }}
                />
                {wrap.metalness > 0.5 && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-[9px] font-semibold leading-tight transition-colors ${
                  selectedWrap === i ? 'text-white' : 'text-white/50 group-hover:text-white/70'
                }`}>
                  {wrap.brand}
                </p>
                <p className={`text-[8px] leading-tight mt-0.5 max-w-[64px] ${
                  selectedWrap === i ? 'text-white/60' : 'text-white/30'
                }`}>
                  {wrap.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 mb-4" delay={0.2}>
        <div className="flex items-center gap-2.5 mb-5">
          <Disc3 className="w-4 h-4 text-[#FF4500]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Wheels</h2>
        </div>

        <div className="space-y-2">
          {WHEEL_OPTIONS.map((w, i) => {
            const isSelected = selectedWheelIndex === i;
            return (
              <button
                key={w.id}
                onClick={() => handleWheelSelect(i)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                  isSelected
                    ? 'bg-[#FF4500]/10 border border-[#FF4500]/40 shadow-[0_0_24px_rgba(255,69,0,0.12)]'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1]'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0 border border-white/10"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${w.material.color}ee, ${w.material.color}88)`,
                  }}
                />
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                    {w.brand}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#FF4500]/80' : 'text-white/30'}`}>
                    {w.model}
                  </p>
                  <p className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/40' : 'text-white/20'}`}>
                    {w.finish}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 mb-4" delay={0.3}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <ArrowDownUp className="w-4 h-4 text-[#FF4500]" />
            <h2 className="text-sm font-semibold text-white tracking-wide">Suspension</h2>
          </div>
          {suspensionHeight !== 0 && (
            <button
              onClick={() => onSuspensionChange(0)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200"
            >
              <RotateCcw className="w-3 h-3 text-white/40" />
              <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Reset</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="px-1">
            <div className="relative">
              <input
                type="range"
                min="-0.3"
                max="0.3"
                step="0.01"
                value={suspensionHeight}
                onChange={(e) => onSuspensionChange(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer suspension-slider relative z-10"
                style={{
                  background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${fillPercent}%, var(--bg-input) ${fillPercent}%, var(--bg-input) 100%)`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2.5">
              <span className="text-[9px] text-white/30 uppercase tracking-wider">Slammed</span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">Stock</span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">Lifted</span>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <div className="flex items-baseline justify-between">
              <div>
                <p className={`text-xs font-bold tracking-wide ${
                  label.color === 'orange' ? 'text-[#FF4500]' : 'text-white/50'
                }`}>
                  {label.text}
                  {label.brand && (
                    <span className={`font-normal text-[10px] ml-1.5 ${
                      label.color === 'orange' ? 'text-[#FF4500]/70' : 'text-white/30'
                    }`}>
                      &mdash; {label.brand}
                    </span>
                  )}
                </p>
              </div>
              <span className="text-[10px] text-white/25 font-mono tabular-nums ml-3 shrink-0">
                {suspensionHeight >= 0 ? '+' : ''}{suspensionHeight.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 mb-4" delay={0.35}>
        <div className="flex items-center gap-2.5 mb-5">
          <PanelTop className="w-4 h-4 text-[#FF4500]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Window Tint</h2>
        </div>
        <div className="space-y-2">
          {tintOptions.map((option, i) => (
            <TintCard
              key={option.id}
              option={option}
              isSelected={selectedTint === i}
              onSelect={() => onTintChange(i)}
            />
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5" delay={0.4}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <AudioLines className="w-4 h-4 text-[#FF4500]" />
            <h2 className="text-sm font-semibold text-white tracking-wide">Exhaust</h2>
          </div>
          {isPlaying && (
            <button
              onClick={stopAudio}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200"
            >
              <StopCircle className="w-3 h-3 text-[#FF4500]/70" />
              <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Stop</span>
            </button>
          )}
        </div>

        <div className="space-y-2">
          {exhaustOptions.map((option, i) => (
            <ExhaustCard
              key={option.id}
              option={option}
              isSelected={selectedExhaustIndex === i}
              isPlaying={playingExhaustIndex === i && isPlaying}
              onSelect={() => handleExhaustSelect(i)}
              onPlaySound={() => handlePlaySound(i)}
            />
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
