import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, HelpCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { ShopNotification } from '../types';
import Header from '../components/Header';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

interface PricingPageProps {
  onBack: () => void;
  onGetStarted: () => void;
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

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  popular?: boolean;
  features: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Get your shop online',
    monthlyPrice: 29,
    features: [
      'Shop profile listing',
      'Up to 10 leads per month',
      'Basic analytics',
      'Email support',
      '5 photos in gallery',
    ],
    cta: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Grow your business',
    monthlyPrice: 79,
    popular: true,
    features: [
      'Everything in Starter',
      'Unlimited leads',
      'Advanced analytics & dashboard',
      'Priority listing on map',
      'Up to 50 photos in gallery',
      'Featured badge on profile',
      'Social media links',
      'Review management',
    ],
    cta: 'Get Started',
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'Dominate your market',
    monthlyPrice: 149,
    features: [
      'Everything in Professional',
      'Top placement on map & search',
      'Unlimited photos',
      'Custom shop banner',
      'Dedicated account manager',
      'Lead notifications',
      'Monthly performance report',
      'Verified Elite badge on profile',
    ],
    cta: 'Get Started',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle, and any price difference is prorated.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Every new shop gets a 14-day free trial on the Professional plan. No credit card required. You can choose your plan before the trial ends.',
  },
  {
    q: 'What counts as a lead?',
    a: 'A lead is any customer who submits a quote request, contacts your shop through the platform, or sends a message through your shop profile page.',
  },
  {
    q: 'Do I need a contract?',
    a: 'No long-term contracts. All plans are month-to-month (or annual with a discount). You can cancel anytime and retain access until the end of your billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. Annual plans can also be paid via bank transfer.',
  },
  {
    q: 'How does priority map placement work?',
    a: 'Professional plan shops appear higher in map search results within their area. Elite shops get the top placement and a prominent pin, maximizing visibility to customers.',
  },
];

export default function PricingPage({ onBack, onGetStarted, user, isShopOwner, profilePictureUrl, onSignOut, notifications, onMarkRead, onMarkAllRead, onViewAllNotifications, onClickNotification }: PricingPageProps) {
  useSEO(SEO_CONFIGS.pricing);
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen w-screen bg-[#080808] light:bg-[#F8F9FA] font-sans antialiased overflow-y-auto momentum-scroll">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,69,0,0.05)_0%,transparent_60%)] light:bg-none pointer-events-none" />

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

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center pt-8 sm:pt-14 mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF4500]/[0.08] border border-[#FF4500]/20 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" />
            <span className="text-[11px] text-[#FF4500] font-semibold tracking-wider uppercase">Shop Plans</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
            Simple, Transparent
            <br />
            <span className="text-[#FF4500]">Pricing</span>
          </h2>
          <p className="text-sm sm:text-base text-white/40 max-w-lg mx-auto leading-relaxed">
            Choose the plan that fits your shop. Upgrade anytime as your business grows. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <BillingToggle annual={annual} onToggle={() => setAnnual(!annual)} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-10 sm:mt-12">
          {PLANS.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              annual={annual}
              index={i}
              onGetStarted={onGetStarted}
            />
          ))}
        </div>

        <FeatureComparison />
        <FaqSection />
        <ContactSection />
      </div>
    </div>
  );
}

function BillingToggle({ annual, onToggle }: { annual: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="flex items-center justify-center gap-4"
    >
      <span className={`text-xs font-semibold transition-colors ${!annual ? 'text-white/80' : 'text-white/30'}`}>
        Monthly
      </span>
      <button
        onClick={onToggle}
        className="relative w-14 h-7 rounded-full bg-white/[0.06] border border-white/[0.1] transition-colors"
      >
        <motion.div
          animate={{ x: annual ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-[#FF4500] shadow-lg shadow-[#FF4500]/30"
        />
      </button>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold transition-colors ${annual ? 'text-white/80' : 'text-white/30'}`}>
          Annual
        </span>
        {annual && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold"
          >
            SAVE 20%
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

function PricingCard({ plan, annual, index, onGetStarted }: { plan: Plan; annual: boolean; index: number; onGetStarted: () => void }) {
  const monthlyPrice = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
  const yearlyTotal = monthlyPrice * 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border p-6 sm:p-7 flex flex-col transition-all duration-300 ${
        plan.popular
          ? 'bg-white/[0.04] border-[#FF4500]/20 shadow-lg shadow-[#FF4500]/[0.04]'
          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3.5 py-1 rounded-full bg-[#FF4500] text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-[#FF4500]/30">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
        <p className="text-xs text-white/30">{plan.tagline}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span className="text-4xl font-black text-white tracking-tight">${monthlyPrice}</span>
          <span className="text-xs text-white/25 mb-1.5">/month</span>
        </div>
        {annual && (
          <p className="text-[10px] text-white/20 mt-1">
            ${yearlyTotal}/year, billed annually
          </p>
        )}
      </div>

      <div className="flex-1 space-y-3 mb-8">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2.5">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              plan.popular
                ? 'bg-[#FF4500]/15'
                : 'bg-white/[0.06]'
            }`}>
              <Check className={`w-2.5 h-2.5 ${plan.popular ? 'text-[#FF4500]' : 'text-white/40'}`} />
            </div>
            <span className="text-xs text-white/50 leading-relaxed">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onGetStarted}
        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
          plan.popular
            ? 'bg-[#FF4500] text-white hover:bg-[#E03E00] shadow-lg shadow-[#FF4500]/20 hover:shadow-[#FF4500]/30'
            : 'bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1]'
        }`}
      >
        {plan.cta}
      </button>
    </motion.div>
  );
}

function FeatureComparison() {
  const features = [
    { name: 'Shop Profile Listing', starter: true, pro: true, elite: true },
    { name: 'Monthly Leads', starter: 'Up to 10', pro: 'Unlimited', elite: 'Unlimited' },
    { name: 'Analytics', starter: 'Basic', pro: 'Advanced', elite: 'Advanced' },
    { name: 'Gallery Photos', starter: '5', pro: '50', elite: 'Unlimited' },
    { name: 'Priority Map Listing', starter: false, pro: true, elite: true },
    { name: 'Top Map Placement', starter: false, pro: false, elite: true },
    { name: 'Featured Badge', starter: false, pro: true, elite: true },
    { name: 'Social Media Links', starter: false, pro: true, elite: true },
    { name: 'Review Management', starter: false, pro: true, elite: true },
    { name: 'Custom Shop Banner', starter: false, pro: false, elite: true },
    { name: 'Lead Notifications', starter: false, pro: false, elite: true },
    { name: 'Dedicated Account Manager', starter: false, pro: false, elite: true },
    { name: 'Monthly Performance Report', starter: false, pro: false, elite: true },
    { name: 'Verified Elite Badge', starter: false, pro: false, elite: true },
    { name: 'Support', starter: 'Email', pro: 'Priority Email', elite: 'Dedicated Manager' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-20 sm:mt-24"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">
        Feature Comparison
      </h3>
      <p className="text-xs text-white/30 text-center mb-10">
        See exactly what you get with each plan
      </p>

      <div className="overflow-x-auto -mx-6 px-6">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-4 gap-3 px-4 py-3 mb-2">
            <div />
            <div className="text-center">
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Starter</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-[#FF4500] uppercase tracking-wider font-semibold">Professional</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Elite</span>
            </div>
          </div>

          {features.map((feat, i) => (
            <div
              key={feat.name}
              className={`grid grid-cols-4 gap-3 px-4 py-3 rounded-xl ${
                i % 2 === 0 ? 'bg-white/[0.02]' : ''
              }`}
            >
              <span className="text-xs text-white/50 font-medium">{feat.name}</span>
              <FeatureCell value={feat.starter} />
              <FeatureCell value={feat.pro} highlight />
              <FeatureCell value={feat.elite} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (typeof value === 'string') {
    return (
      <div className="text-center">
        <span className={`text-[11px] font-medium ${highlight ? 'text-[#FF4500]/70' : 'text-white/35'}`}>
          {value}
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {value ? (
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
          highlight ? 'bg-[#FF4500]/15' : 'bg-white/[0.06]'
        }`}>
          <Check className={`w-3 h-3 ${highlight ? 'text-[#FF4500]' : 'text-white/40'}`} />
        </div>
      ) : (
        <span className="text-white/10 text-sm">&mdash;</span>
      )}
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-20 sm:mt-24"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <HelpCircle className="w-5 h-5 text-[#FF4500]/40" />
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          Frequently Asked Questions
        </h3>
      </div>
      <p className="text-xs text-white/30 text-center mb-10">
        Everything you need to know about our plans
      </p>

      <div className="max-w-2xl mx-auto space-y-2">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`rounded-xl border transition-all duration-200 ${
                isOpen
                  ? 'bg-white/[0.03] border-white/[0.08]'
                  : 'bg-white/[0.01] border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-white/80' : 'text-white/50'}`}>
                  {item.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-white/20 shrink-0 ml-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/20 shrink-0 ml-3" />
                )}
              </button>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4"
                >
                  <p className="text-xs text-white/35 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function ContactSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-20 sm:mt-24"
    >
      <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Not sure which plan?
          </h3>
          <p className="text-xs sm:text-sm text-white/35 max-w-md mx-auto mb-8 leading-relaxed">
            Our team can help you find the right fit for your shop. Get a personalized recommendation based on your business needs.
          </p>
          <a href="#/contact" className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.12] transition-all duration-200">
            <Mail className="w-4 h-4" />
            Contact Us
          </a>
        </div>
      </div>
    </motion.div>
  );
}
