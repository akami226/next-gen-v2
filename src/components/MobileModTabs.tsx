import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDot, Disc3, ArrowDownUp, AudioLines, PanelTop, RotateCcw, StopCircle, Volume2, Square } from 'lucide-react';
import SectionLabel from './SectionLabel';
import TintCard from './TintCard';
import type { Wrap, CarOption, TintOption } from '../types';
import {
  SUSPENSION_SLIDER_MAX,
  SUSPENSION_SLIDER_MIN,
  SUSPENSION_SLIDER_STEP,
} from '../lib/configuratorConstants';
import { WHEEL_OPTIONS } from '../data/wheelOptions';
import { formatPrice } from '../data/pricing';

const TABS = [
  { id: 'wraps', label: 'Wraps', icon: CircleDot },
  { id: 'wheels', label: 'Wheels', icon: Disc3 },
  { id: 'tint', label: 'Tint', icon: PanelTop },
  { id: 'exhaust', label: 'Exhaust', icon: AudioLines },
  { id: 'suspension', label: 'Ride', icon: ArrowDownUp },
] as const;

type TabId = typeof TABS[number]['id'];

function getSuspensionLabel(value: number): { text: string; brand: string; color: 'orange' | 'gray' } {
  if (value <= -0.2) return { text: 'SLAMMED', brand: 'Air Lift Performance 3P', color: 'orange' };
  if (value <= -0.05) return { text: 'LOWERED', brand: 'KW V3 Coilovers', color: 'orange' };
  if (value <= 0.04) return { text: 'STOCK RIDE HEIGHT', brand: '', color: 'gray' };
  if (value <= 0.19) return { text: 'RAISED', brand: 'KW V3 Coilovers', color: 'gray' };
  return { text: 'LIFTED', brand: 'ReadyLIFT 4 inch Kit', color: 'orange' };
}

function SoundWaveAnimation() {
  return (
    <div className="flex items-center gap-[3px] h-4">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-[#FF4500] sound-bar"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

interface MobileModTabsProps {
  cars: CarOption[];
  selectedCarIndex: number;
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

export default function MobileModTabs({
  cars,
  selectedCarIndex,
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
}: MobileModTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('wraps');
  const [playingExhaustIndex, setPlayingExhaustIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.play().catch(() => {
      setIsPlaying(false);
      setPlayingExhaustIndex(null);
    });
  }, [playingExhaustIndex, isPlaying, exhaustOptions, stopAudio]);

  const label = useMemo(() => getSuspensionLabel(suspensionHeight), [suspensionHeight]);
  const fillPercent =
    ((suspensionHeight - SUSPENSION_SLIDER_MIN) / (SUSPENSION_SLIDER_MAX - SUSPENSION_SLIDER_MIN)) * 100;

  return (
    <div className="bg-white/[0.03] border-t border-white/[0.06]">
      <div className="flex overflow-x-auto hide-scrollbar border-b border-white/[0.06]">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 min-w-fit whitespace-nowrap text-xs font-medium transition-colors border-b-2 ${
                active
                  ? 'text-[#FF4500] border-[#FF4500]'
                  : 'text-white/40 border-transparent'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="p-4 max-h-[50vh] overflow-y-auto momentum-scroll custom-scrollbar"
        >
          {activeTab === 'wraps' && (
            <div>
              <SectionLabel label="Color" />
              <div className="grid grid-cols-5 gap-3">
                {wraps.map((wrap, i) => (
                  <button
                    key={i}
                    onClick={() => onWrapChange(i)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full transition-all duration-300 ${
                          selectedWrap === i ? 'scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: wrap.hex,
                          boxShadow: selectedWrap === i
                            ? '0 0 0 2px var(--bg-body), 0 0 0 4px #FF4500, 0 0 12px rgba(255, 69, 0, 0.4)'
                            : '0 0 0 1px rgba(255,255,255,0.08)',
                        }}
                      />
                      {wrap.metalness > 0.5 && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-[9px] font-semibold leading-tight ${
                        selectedWrap === i ? 'text-white' : 'text-white/50'
                      }`}>{wrap.brand}</p>
                      <p className={`text-[8px] leading-tight mt-0.5 max-w-[64px] ${
                        selectedWrap === i ? 'text-white/60' : 'text-white/30'
                      }`}>{wrap.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wheels' && (
            <div className="space-y-2">
              {WHEEL_OPTIONS.map((w, i) => {
                const isSelected = selectedWheelIndex === i;
                return (
                  <button
                    key={w.id}
                    onClick={() => onWheelChange(i)}
                    className={`w-full text-left px-4 py-3.5 min-h-[44px] rounded-xl transition-all duration-300 flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#FF4500]/10 border border-[#FF4500]/40'
                        : 'bg-white/[0.03] border border-white/[0.06]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full shrink-0 border border-white/10"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${w.material.color}ee, ${w.material.color}88)`,
                      }}
                    />
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>{w.brand}</p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#FF4500]/80' : 'text-white/30'}`}>{w.model}</p>
                      <p className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/40' : 'text-white/20'}`}>{w.finish}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'tint' && (
            <div className="space-y-2">
              {tintOptions.map((option, i) => (
                <TintCard key={option.id} option={option} isSelected={selectedTint === i} onSelect={() => onTintChange(i)} />
              ))}
            </div>
          )}

          {activeTab === 'exhaust' && (
            <div>
              {isPlaying && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={stopAudio}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] min-h-[44px]"
                  >
                    <StopCircle className="w-3.5 h-3.5 text-[#FF4500]/70" />
                    <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Stop</span>
                  </button>
                </div>
              )}
              <div className="space-y-2">
                {exhaustOptions.map((option, i) => {
                  const isSelected = selectedExhaustIndex === i;
                  const isSoundPlaying = playingExhaustIndex === i && isPlaying;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleExhaustSelect(i)}
                      className={`w-full text-left px-4 py-3.5 min-h-[44px] rounded-xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#FF4500]/10 border border-[#FF4500]/40'
                          : 'bg-white/[0.03] border border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>{option.brand}</p>
                            <span className={`text-[10px] font-semibold tabular-nums ${isSelected ? 'text-[#FF4500]' : 'text-white/30'}`}>
                              ${formatPrice(option.price)}
                            </span>
                          </div>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#FF4500]/80' : 'text-white/30'}`}>{option.product}</p>
                          <p className={`text-[9px] mt-1 leading-relaxed ${isSelected ? 'text-white/40' : 'text-white/20'}`}>{option.description}</p>
                        </div>
                        <div className="ml-3 flex items-center gap-2 shrink-0">
                          {isSoundPlaying && <SoundWaveAnimation />}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaySound(i);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handlePlaySound(i);
                              }
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center ${
                              isSoundPlaying ? 'bg-[#FF4500]/20 text-[#FF4500]' : 'bg-white/[0.06] text-white/30'
                            }`}
                          >
                            {isSoundPlaying ? (
                              <Square className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'suspension' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-white/50">Suspension Height</h3>
                {suspensionHeight !== 0 && (
                  <button
                    onClick={() => onSuspensionChange(0)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] min-h-[44px]"
                  >
                    <RotateCcw className="w-3 h-3 text-white/40" />
                    <span className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Reset</span>
                  </button>
                )}
              </div>
              <div className="px-1">
                <input
                  type="range"
                  min={SUSPENSION_SLIDER_MIN}
                  max={SUSPENSION_SLIDER_MAX}
                  step={SUSPENSION_SLIDER_STEP}
                  value={suspensionHeight}
                  onInput={(e) => onSuspensionChange(parseFloat((e.target as HTMLInputElement).value))}
                  onChange={(e) => onSuspensionChange(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer suspension-slider touch-pan-y"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${fillPercent}%, var(--bg-input) ${fillPercent}%, var(--bg-input) 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2.5">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">Slammed</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">Stock</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-wider">Lifted</span>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
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
                <span className="text-[10px] text-white/25 font-mono tabular-nums">
                  {suspensionHeight >= 0 ? '+' : ''}{suspensionHeight.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
