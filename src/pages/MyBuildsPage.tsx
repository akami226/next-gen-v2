import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, ArrowLeft, Palette, Disc3, PanelTop, AudioLines, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

interface SavedBuild {
  id: string;
  name: string;
  car: string;
  wrap: string;
  wheels: string;
  tint: string;
  exhaust: string;
  car_index: number;
  wrap_index: number;
  wheel_index: number;
  tint_index: number;
  thumbnail_url: string;
  created_at: string;
}

interface MyBuildsPageProps {
  user: User;
  onBack: () => void;
  onLoadBuild: (build: SavedBuild) => void;
  onNewBuild: () => void;
}

const BUILD_FIELDS = [
  { key: 'car', label: 'Vehicle', icon: Car },
  { key: 'wrap', label: 'Wrap', icon: Palette },
  { key: 'wheels', label: 'Wheels', icon: Disc3 },
  { key: 'tint', label: 'Tint', icon: PanelTop },
  { key: 'exhaust', label: 'Exhaust', icon: AudioLines },
] as const;

export default function MyBuildsPage({ user, onBack, onLoadBuild, onNewBuild }: MyBuildsPageProps) {
  useSEO(SEO_CONFIGS.myBuilds);
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBuilds = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('saved_builds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setBuilds(data ?? []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchBuilds(); }, [fetchBuilds]);

  const handleDelete = useCallback(async (id: string) => {
    setDeleting(id);
    await supabase.from('saved_builds').delete().eq('id', id);
    setBuilds(prev => prev.filter(b => b.id !== id));
    setDeleting(null);
  }, []);

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="h-screen w-screen bg-[#080808] font-sans antialiased overflow-y-auto momentum-scroll">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,69,0,0.04)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF4500]/15 flex items-center justify-center">
              <Car className="w-5 h-5 text-[#FF4500]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">NextGen</h1>
              <p className="text-[10px] text-white/30 tracking-widest uppercase">3D Configurator</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">My Builds</h2>
          <p className="text-sm text-white/30">Welcome back, {displayName}</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin mb-3" />
            <span className="text-xs text-white/30">Loading builds...</span>
          </div>
        ) : builds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
              <Car className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No builds yet</h3>
            <p className="text-sm text-white/30 mb-6 text-center max-w-xs">
              Start configuring your dream car and save your first build
            </p>
            <button
              onClick={onNewBuild}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#FF4500]/20 hover:bg-[#FF5722] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              New Build
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] text-white/30">
                {builds.length} build{builds.length !== 1 ? 's' : ''} saved
              </p>
              <button
                onClick={onNewBuild}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF4500] text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-[#FF4500]/20 hover:bg-[#FF5722] active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                New Build
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {builds.map((build, i) => (
                  <motion.div
                    key={build.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.1] transition-colors duration-300 group"
                  >
                    <div className="h-32 bg-gradient-to-br from-[#FF4500]/[0.08] to-transparent flex items-center justify-center relative">
                      {build.thumbnail_url ? (
                        <img src={build.thumbnail_url} alt={build.name} className="w-full h-full object-cover" />
                      ) : (
                        <Car className="w-12 h-12 text-[#FF4500]/30" />
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(build.id); }}
                          disabled={deleting === build.id}
                          className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                        >
                          {deleting === build.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-white truncate">{build.name}</h4>
                        <span className="text-[10px] text-white/20 shrink-0 ml-2">
                          {new Date(build.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        {BUILD_FIELDS.map(({ key, label, icon: Icon }) => (
                          <div key={key} className="flex items-center gap-2">
                            <Icon className="w-3 h-3 text-[#FF4500]/50 shrink-0" />
                            <span className="text-[10px] text-white/25 w-11 shrink-0">{label}</span>
                            <span className="text-[10px] text-white/50 truncate">{build[key]}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => onLoadBuild(build)}
                        className="w-full py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-white/[0.1] active:scale-[0.98] transition-all"
                      >
                        Load Build
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export type { SavedBuild };
