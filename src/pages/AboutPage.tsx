import { motion } from 'framer-motion';
import {
  Car,
  Eye,
  MapPin,
  Send,
  Users,
  Store,
  Building2,
  Smile,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Star,
  BarChart3,
  Globe,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { ShopNotification } from '../types';
import Header from '../components/Header';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

interface AboutPageProps {
  onBack: () => void;
  onStartConfiguring: () => void;
  onRegisterShop: () => void;
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

const STATS = [
  { icon: Car, value: '12,000+', label: 'Car Builds Created' },
  { icon: Store, value: '350+', label: 'Verified Shops' },
  { icon: Building2, value: '120+', label: 'Cities Covered' },
  { icon: Smile, value: '8,500+', label: 'Happy Customers' },
];

const STEPS = [
  {
    number: '01',
    icon: Eye,
    title: 'Visualize Your Build',
    description: 'Configure wraps, wheels, tint, and exhaust on real 3D car models. See every modification in real time before spending a dollar.',
  },
  {
    number: '02',
    icon: MapPin,
    title: 'Find Verified Shops',
    description: 'Browse a curated map of verified local shops near you. Read reviews, compare services, and choose the right fit for your project.',
  },
  {
    number: '03',
    icon: Send,
    title: 'Send Your Build',
    description: 'Submit your exact build configuration directly to a shop. Get accurate quotes, schedule the work, and get it done right.',
  },
];

const SHOP_BENEFITS = [
  { icon: TrendingUp, title: 'Qualified Leads', desc: 'Receive build requests from customers who already know exactly what they want.' },
  { icon: Star, title: 'Build Your Reputation', desc: 'Collect verified reviews and showcase your best work to attract more business.' },
  { icon: BarChart3, title: 'Dashboard Analytics', desc: 'Track leads, manage quotes, and monitor your shop performance in real time.' },
  { icon: Globe, title: 'Online Presence', desc: 'Get a professional shop profile page that ranks in local search results.' },
];

const USER_BENEFITS = [
  { icon: Eye, title: 'Free 3D Configurator', desc: 'No account needed. Visualize modifications on real car models instantly.' },
  { icon: Shield, title: 'Verified Shops Only', desc: 'Every shop on our platform is reviewed and verified for quality and professionalism.' },
  { icon: Zap, title: 'Instant Quotes', desc: 'Send your exact build to shops and receive accurate pricing without phone tag.' },
  { icon: Users, title: 'Community Reviews', desc: 'Read honest reviews from real customers before choosing a shop.' },
];

const TEAM = [
  { name: 'Alex Rivera', role: 'Founder & CEO', initials: 'AR' },
  { name: 'Jordan Chen', role: 'CTO', initials: 'JC' },
  { name: 'Sam Nguyen', role: 'Head of Design', initials: 'SN' },
  { name: 'Taylor Brooks', role: 'Head of Partnerships', initials: 'TB' },
];

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

export default function AboutPage({ onBack, onStartConfiguring, onRegisterShop, user, isShopOwner, profilePictureUrl, onSignOut, notifications, onMarkRead, onMarkAllRead, onViewAllNotifications, onClickNotification }: AboutPageProps) {
  useSEO(SEO_CONFIGS.about);

  return (
    <div className="min-h-screen w-screen bg-[#080808] light:bg-[#F8F9FA] font-sans antialiased overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none light:hidden">
        <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF4500]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF4500]/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-50">
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

      <section className="relative px-6 py-20 sm:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF4500]/[0.08] border border-[#FF4500]/20 mb-8">
            <Target className="w-3.5 h-3.5 text-[#FF4500]" />
            <span className="text-[11px] text-[#FF4500] font-semibold tracking-wider uppercase">Our Mission</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Bridging the Gap Between
            <br />
            <span className="text-[#FF4500]">Vision and Reality</span>
          </h2>
          <p className="text-base sm:text-lg text-white/40 leading-relaxed max-w-xl mx-auto">
            We are building the future of automotive customization -- where every car enthusiast can see their dream build come to life before a single part is installed.
          </p>
        </motion.div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Our Story</h3>
            <div className="w-12 h-0.5 bg-[#FF4500]/40 mx-auto rounded-full" />
          </motion.div>
          <motion.div {...fade} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-6 text-sm text-white/45 leading-relaxed max-w-2xl mx-auto">
            <p>
              NextGen was born from a simple frustration: the disconnect between imagining a car mod and actually seeing what it looks like. Too many enthusiasts spend thousands on wraps, wheels, and tint without ever previewing the result -- and too many shops lose potential customers who cannot visualize the end product.
            </p>
            <p>
              We set out to solve both problems at once. Our platform gives car owners a free, interactive 3D configurator to experiment with real products on real car models. When they are ready, they can find a verified local shop and send their exact build configuration for a quote.
            </p>
            <p>
              For shops, it means higher-quality leads from customers who already know what they want. No more back-and-forth. No more guesswork. Just real builds, real customers, and real business.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center mx-auto mb-5">
              <Target className="w-6 h-6 text-[#FF4500]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-sm sm:text-base text-white/40 leading-relaxed max-w-lg mx-auto">
              To make automotive customization accessible, transparent, and exciting for everyone -- by connecting enthusiasts with the tools to visualize their builds and the shops to make them real.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">How It Works</h3>
            <p className="text-sm text-white/30 max-w-md mx-auto">Three simple steps from dream to reality</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-[#FF4500]/20 transition-colors duration-300"
              >
                <span className="text-[40px] font-black text-white/[0.04] absolute top-4 right-5 leading-none">{step.number}</span>
                <div className="w-11 h-11 rounded-xl bg-[#FF4500]/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-[#FF4500]" />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{step.title}</h4>
                <p className="text-[12px] text-white/35 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center hover:border-[#FF4500]/15 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-[#FF4500]" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-[10px] text-white/30 font-medium tracking-wider uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">For Shops</h3>
            <p className="text-sm text-white/30 max-w-md mx-auto">Grow your business with qualified leads from enthusiasts ready to build</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SHOP_BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-[#FF4500]/15 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-[#FF4500]" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{b.title}</h4>
                <p className="text-[12px] text-white/35 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">For Users</h3>
            <p className="text-sm text-white/30 max-w-md mx-auto">Everything you need to go from idea to installed</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {USER_BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-[#FF4500]/15 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF4500]/10 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-[#FF4500]" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">{b.title}</h4>
                <p className="text-[12px] text-white/35 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="text-center mb-14">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Our Team</h3>
            <p className="text-sm text-white/30 max-w-md mx-auto">The people behind NextGen</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                {...fade}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-white/[0.1] transition-colors duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-[#FF4500]">{member.initials}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{member.name}</h4>
                <p className="text-[11px] text-white/30">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20 sm:py-28">
        <motion.div
          {...fade}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-lg mx-auto text-center"
        >
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 sm:p-10">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center mx-auto mb-5">
              <Car className="w-6 h-6 text-[#FF4500]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Ready to Get Started?</h3>
            <p className="text-sm text-white/35 mb-8 leading-relaxed">
              Whether you are an enthusiast or a shop owner, NextGen has something for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onStartConfiguring}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#FF4500]/25 hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200"
              >
                Start Configuring
              </button>
              <button
                onClick={onRegisterShop}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white text-sm font-bold uppercase tracking-wider hover:bg-white/[0.1] active:scale-[0.98] transition-all duration-200"
              >
                Register Your Shop
              </button>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-12">
          <p className="text-[10px] text-white/15 tracking-wider uppercase">
            NextGen 3D Configurator &mdash; Built for enthusiasts
          </p>
        </div>
      </section>
    </div>
  );
}
