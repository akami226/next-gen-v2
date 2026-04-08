import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Check, Car, Palette, Disc3, PanelTop, AudioLines } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { BuildConfig } from '../types';

interface SaveBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  buildConfig: BuildConfig;
  buildIndices: { carIndex: number; wrapIndex: number; wheelIndex: number; tintIndex: number };
}

const BUILD_ITEMS = [
  { key: 'car' as const, label: 'Vehicle', icon: Car },
  { key: 'wrap' as const, label: 'Wrap', icon: Palette },
  { key: 'wheels' as const, label: 'Wheels', icon: Disc3 },
  { key: 'tint' as const, label: 'Tint', icon: PanelTop },
  { key: 'exhaust' as const, label: 'Exhaust', icon: AudioLines },
];

export default function SaveBuildModal({ isOpen, onClose, user, buildConfig, buildIndices }: SaveBuildModalProps) {
  const [name, setName] = useState(`${buildConfig.car} Build`);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    await supabase.from('saved_builds').insert({
      user_id: user.id,
      name: name.trim() || `${buildConfig.car} Build`,
      car: buildConfig.car,
      wrap: buildConfig.wrap,
      wheels: buildConfig.wheels,
      tint: buildConfig.tint,
      exhaust: buildConfig.exhaust,
      car_index: buildIndices.carIndex,
      wrap_index: buildIndices.wrapIndex,
      wheel_index: buildIndices.wheelIndex,
      tint_index: buildIndices.tintIndex,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  }, [user.id, name, buildConfig, buildIndices, onClose]);

  const handleClose = useCallback(() => {
    setSaved(false);
    setSaving(false);
    setName(`${buildConfig.car} Build`);
    onClose();
  }, [buildConfig.car, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
          className="overflow-y-auto"
          onClick={handleClose}
        >
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            className="pointer-events-none"
          />

          <div className="relative flex items-start justify-center min-h-full py-8 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-[420px] bg-[#0e0e0e] light:bg-white border border-white/[0.08] light:border-gray-200 rounded-2xl shadow-2xl shadow-black/50 light:shadow-xl light:shadow-black/10 p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Save Build</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {saved ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-8"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <Check className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Build Saved!</h3>
                  <p className="text-sm text-white/40">View it in My Builds anytime</p>
                </motion.div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                      Build Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)] transition-all"
                      placeholder="Name your build"
                    />
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mt-4 mb-5">
                    <div className="space-y-2">
                      {BUILD_ITEMS.map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center gap-3">
                          <Icon className="w-3.5 h-3.5 text-[#FF4500]/60 shrink-0" />
                          <span className="text-[10px] text-white/30 w-14 shrink-0">{label}</span>
                          <span className="text-[11px] text-white/70 font-medium truncate">{buildConfig[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save to My Builds
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
