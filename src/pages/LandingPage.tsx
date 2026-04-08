import { motion } from 'framer-motion';
import { Car, Palette, Disc3, AudioLines, PanelTop, ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { ShopNotification } from '../types';
import Header from '../components/Header';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';
import { useWebApplicationSchema } from '../components/StructuredData';

interface LandingPageProps {
  onStart: () => void;
  user?: User | null;
  isShopOwner?: boolean;
  profilePictureUrl?: string | null;
  onSignOut?: () => void;
  notifications?: ShopNotification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onViewAllNotifications?: () => void;
  onClickNotification?: (notification: ShopNotification) => void;
}

const FEATURES = [
  { icon: Palette, title: 'Premium Wraps', desc: 'Browse vinyl wraps from 3M, Avery Dennison, and XPEL in real time' },
  { icon: Disc3, title: 'Aftermarket Wheels', desc: 'Preview forged and flow-formed wheels from top brands' },
  { icon: PanelTop, title: 'Window Tint', desc: 'Visualize tint darkness from factory clear to full limo' },
  { icon: AudioLines, title: 'Exhaust Audio', desc: 'Listen to exhaust systems from Akrapovic, Borla, and more' },
];

export default function LandingPage({ onStart, user, isShopOwner, profilePictureUrl, onSignOut, notifications, onMarkRead, onMarkAllRead, onViewAllNotifications, onClickNotification }: LandingPageProps) {
  useSEO(SEO_CONFIGS.home);
  useWebApplicationSchema();

  return (
    <div className="h-screen w-screen bg-[#080808] light:bg-[#f0f0f2] font-sans antialiased overflow-y-auto momentum-scroll">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header
          user={user}
          isShopOwner={isShopOwner}
          profilePictureUrl={profilePictureUrl}
          onSignOut={onSignOut}
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onViewAllNotifications={onViewAllNotifications}
          onClickNotification={onClickNotification}
        />
      </div>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,69,0,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,69,0,0.03)_0%,transparent_50%)]" />

        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF4500]/[0.08] border border-[#FF4500]/20 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" />
            <span className="text-[11px] text-[#FF4500] font-semibold tracking-wider uppercase">Real-Time 3D Preview</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white light:text-gray-900 leading-[1.1] tracking-tight mb-6">
            Build Your Dream
            <br />
            <span className="text-[#FF4500]">Car Setup</span>
          </h2>

          <p className="text-base sm:text-lg text-white/40 light:text-gray-500 leading-relaxed max-w-lg mx-auto mb-10">
            Configure wraps, wheels, tint, exhaust, and suspension on real car models in an interactive 3D environment. See every detail before you commit.
          </p>

          <motion.button
            onClick={onStart}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-8 py-4 min-h-[52px] rounded-2xl bg-[#FF4500] text-white text-sm sm:text-base font-bold uppercase tracking-wider shadow-xl shadow-[#FF4500]/25 hover:bg-[#FF5722] transition-colors duration-200"
          >
            Start Configuring
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-5 h-5 text-white/20 light:text-gray-300 animate-bounce" />
        </motion.div>
      </section>

      <section className="relative px-6 py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent light:hidden" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white light:text-gray-900 mb-3">Everything You Need</h3>
            <p className="text-sm text-white/30 light:text-gray-500 max-w-md mx-auto">
              A complete toolkit for visualizing aftermarket modifications on real car models
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/[0.03] light:bg-white/80 border border-white/[0.06] light:border-gray-200 rounded-2xl p-6 hover:border-white/[0.1] light:hover:border-gray-300 transition-colors duration-300 light:shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-[#FF4500]" />
                </div>
                <h4 className="text-sm font-bold text-white light:text-gray-900 mb-1.5">{feat.title}</h4>
                <p className="text-[12px] text-white/35 light:text-gray-500 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg mx-auto text-center"
        >
          <div className="bg-white/[0.03] light:bg-white/80 border border-white/[0.06] light:border-gray-200 rounded-2xl p-8 sm:p-10 light:shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center mx-auto mb-5">
              <Car className="w-6 h-6 text-[#FF4500]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white light:text-gray-900 mb-3">Ready to Build?</h3>
            <p className="text-sm text-white/35 light:text-gray-500 mb-8 leading-relaxed">
              Jump into the 3D configurator and start designing your perfect setup.
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-3 px-8 py-4 min-h-[52px] rounded-2xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider shadow-xl shadow-[#FF4500]/25 hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200"
            >
              Launch Configurator
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="text-center mt-12">
          <p className="text-[10px] text-white/15 light:text-gray-400 tracking-wider uppercase">
            NextGen 3D Configurator &mdash; Built for enthusiasts
          </p>
        </div>
      </section>
    </div>
  );
}
