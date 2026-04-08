import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Share2, Wrench, Check } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { BuildConfig, Shop } from '../types';
import ShareModal from './ShareModal';
import GetBuiltModal from './GetBuiltModal';
import SaveBuildModal from './SaveBuildModal';

interface ConfiguratorActionsProps {
  buildConfig: BuildConfig;
  buildIndices: { carIndex: number; wrapIndex: number; wheelIndex: number; tintIndex: number };
  user: User | null;
  shops: Shop[];
  onScreenshot: () => void;
  onNavigateAuth: () => void;
  estimatedPrice?: string;
}

export default function ConfiguratorActions({
  buildConfig,
  buildIndices,
  user,
  shops,
  onScreenshot,
  onNavigateAuth,
  estimatedPrice,
}: ConfiguratorActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [getBuiltOpen, setGetBuiltOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [screenshotDone, setScreenshotDone] = useState(false);

  const handleScreenshot = useCallback(() => {
    onScreenshot();
    setScreenshotDone(true);
    setTimeout(() => setScreenshotDone(false), 2000);
  }, [onScreenshot]);

  const handleSaveClick = useCallback(() => {
    if (user) {
      setSaveOpen(true);
    } else {
      onNavigateAuth();
    }
  }, [user, onNavigateAuth]);

  return (
    <>
      <div className="flex items-center gap-2">
        <ActionButton
          icon={screenshotDone ? Check : Camera}
          label={screenshotDone ? 'Saved' : 'Screenshot'}
          onClick={handleScreenshot}
          active={screenshotDone}
        />
        <ActionButton
          icon={Save}
          label="Save"
          onClick={handleSaveClick}
        />
        <ActionButton
          icon={Share2}
          label="Share"
          onClick={() => setShareOpen(true)}
        />
        <ActionButton
          icon={Wrench}
          label="Get Built"
          onClick={() => setGetBuiltOpen(true)}
          primary
        />
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        buildConfig={buildConfig}
      />

      <GetBuiltModal
        isOpen={getBuiltOpen}
        onClose={() => setGetBuiltOpen(false)}
        shops={shops}
        buildConfig={buildConfig}
        estimatedPrice={estimatedPrice}
      />

      {user && (
        <SaveBuildModal
          isOpen={saveOpen}
          onClose={() => setSaveOpen(false)}
          user={user}
          buildConfig={buildConfig}
          buildIndices={buildIndices}
        />
      )}
    </>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
  active,
  spinning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  primary?: boolean;
  active?: boolean;
  spinning?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
        primary
          ? 'bg-[#FF4500] text-white shadow-lg shadow-[#FF4500]/20 hover:bg-[#FF5722]'
          : active
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-white/[0.06] dark:bg-white/[0.06] light:bg-black/[0.05] border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.1] text-white/60 dark:text-white/60 light:text-gray-600 hover:text-white/90 dark:hover:text-white/90 light:hover:text-gray-800 hover:bg-white/[0.1] dark:hover:bg-white/[0.1] light:hover:bg-black/[0.08]'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
