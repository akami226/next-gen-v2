import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket, CreditCard, Calendar, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    icon: Zap,
    color: '#6B7280',
    features: [
      'Basic shop profile',
      'Up to 10 photos',
      'Receive quote requests',
      'Review management',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    icon: Crown,
    color: '#FF4500',
    popular: true,
    features: [
      'Everything in Starter',
      'Priority listing in search',
      'Unlimited photos',
      'Advanced analytics',
      'Lead management tools',
      'Custom branding',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    icon: Rocket,
    color: '#3B82F6',
    features: [
      'Everything in Pro',
      'Multiple locations',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'White-label options',
      'Phone support',
    ],
  },
];

export default function DashboardSubscription() {
  const [currentPlan] = useState('starter');

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-white">Subscription</h2>
        <p className="text-sm text-white/40 mt-1">Manage your plan and billing.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#6B7280]" />
              <h3 className="text-sm font-bold text-white">Starter Plan</h3>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                Active
              </span>
            </div>
            <p className="text-xs text-white/40">Free plan with basic features.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <CreditCard className="w-3.5 h-3.5" />
              <span>No card on file</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>No billing date</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.id;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`relative rounded-2xl p-5 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-[#FF4500]/[0.06] border-2 border-[#FF4500]/20'
                    : 'bg-white/[0.04] border border-white/[0.08]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF4500] text-[9px] font-bold text-white uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${plan.color}15`, border: `1px solid ${plan.color}25` }}
                >
                  <Icon className="w-5 h-5" style={{ color: plan.color }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-white">${plan.price}</span>
                  <span className="text-xs text-white/30">/month</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400/60 shrink-0 mt-0.5" />
                      <span className="text-xs text-white/45">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-white/[0.06] border border-white/[0.08] text-white/30 cursor-default'
                      : plan.popular
                      ? 'bg-[#FF4500] hover:bg-[#FF5722] text-white shadow-lg shadow-[#FF4500]/20'
                      : 'bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  {isCurrent ? (
                    'Current Plan'
                  ) : (
                    <>
                      Upgrade
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
