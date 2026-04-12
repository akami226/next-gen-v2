import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, TrendingUp, Calendar, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { getAdminSubscriptions, getMonthlyRevenue, type AdminSubscription } from '../../data/adminDemo';

const STATUS_STYLES = {
  active: { label: 'Active', color: '#10B981', icon: CheckCircle2 },
  past_due: { label: 'Past Due', color: '#F59E0B', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: XCircle },
} as const;

const PLAN_STYLES = {
  starter: { label: 'Starter', color: '#3B82F6' },
  professional: { label: 'Professional', color: 'var(--accent)' },
  elite: { label: 'Elite', color: '#10B981' },
} as const;

export default function AdminSubscriptions() {
  const subs = useMemo(() => getAdminSubscriptions(), []);
  const revenue = useMemo(() => getMonthlyRevenue(), []);

  const activeSubs = subs.filter((s) => s.status === 'active');
  const totalMonthly = activeSubs.reduce((s, sub) => s + sub.price, 0);

  const planBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    activeSubs.forEach((s) => {
      if (!counts[s.plan]) counts[s.plan] = { count: 0, revenue: 0 };
      counts[s.plan].count++;
      counts[s.plan].revenue += s.price;
    });
    return counts;
  }, [activeSubs]);

  const statCards = [
    { label: 'Active Subscriptions', value: activeSubs.length, icon: CreditCard, color: '#10B981' },
    { label: 'Monthly Revenue', value: `$${totalMonthly.toLocaleString()}`, icon: DollarSign, color: '#F59E0B' },
    { label: 'Past Due', value: subs.filter((s) => s.status === 'past_due').length, icon: AlertTriangle, color: '#EF4444' },
    { label: 'MRR Growth', value: '+18%', icon: TrendingUp, color: '#3B82F6' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl font-bold text-white">Subscription Management</h2>
        <p className="text-sm text-white/40 mt-1">Revenue tracking and subscription status across all shops.</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{
                  backgroundColor: card.color.startsWith('var(') ? 'var(--accent-bg-subtle)' : `${card.color}15`,
                  border: `1px solid ${card.color.startsWith('var(') ? 'var(--accent-border-subtle)' : `${card.color}25`}`,
                }}
              >
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-5">Revenue by Plan</h3>
          <div className="space-y-4">
            {(['starter', 'professional', 'elite'] as const).map((plan) => {
              const cfg = PLAN_STYLES[plan];
              const data = planBreakdown[plan] || { count: 0, revenue: 0 };
              const maxRev = Math.max(...Object.values(planBreakdown).map((d) => d.revenue));
              const pct = maxRev > 0 ? (data.revenue / maxRev) * 100 : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/30">{data.count} shops</span>
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>${data.revenue}/mo</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-5">Revenue Trend</h3>
          <div className="flex items-end gap-4 h-36">
            {revenue.map((d) => {
              const total = d.starter + d.professional + d.elite;
              const maxVal = Math.max(...revenue.map((r) => r.starter + r.professional + r.elite));
              const pct = (total / maxVal) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center group relative">
                  <div className="absolute bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-[#1a1a1a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-lg">
                      <p className="text-white/60 font-medium">{d.month}: ${total}</p>
                    </div>
                  </div>
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-[#FF4500]/40 to-[#FF4500]/80 hover:from-[#FF4500]/60 hover:to-[#FF4500] transition-colors"
                    style={{ height: `${pct}%`, minHeight: 4 }}
                  />
                  <span className="text-[9px] text-white/25 mt-2 font-medium">{d.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
      >
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">All Subscriptions</h3>
        <div className="space-y-2">
          {subs.map((sub, i) => (
            <SubscriptionRow key={sub.id} sub={sub} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SubscriptionRow({ sub, index }: { sub: AdminSubscription; index: number }) {
  const statusCfg = STATUS_STYLES[sub.status];
  const StatusIcon = statusCfg.icon;
  const planCfg = PLAN_STYLES[sub.plan as keyof typeof PLAN_STYLES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 * index }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
        <CreditCard className="w-3.5 h-3.5 text-white/30" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/60 font-medium truncate">{sub.shopName}</p>
        <p className="text-[10px] text-white/25 truncate">{sub.owner}</p>
      </div>
      <span
        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 hidden sm:block"
        style={{
          backgroundColor: planCfg.color.startsWith('var(') ? 'var(--accent-bg-subtle)' : `${planCfg.color}15`,
          color: planCfg.color,
          border: `1px solid ${planCfg.color.startsWith('var(') ? 'var(--accent-border-subtle)' : `${planCfg.color}25`}`,
        }}
      >
        {planCfg.label}
      </span>
      <span className="text-xs text-white/50 font-bold shrink-0">${sub.price}/mo</span>
      <span
        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0"
        style={{
          backgroundColor: statusCfg.color.startsWith('var(') ? 'var(--accent-bg-subtle)' : `${statusCfg.color}15`,
          color: statusCfg.color,
          border: `1px solid ${statusCfg.color.startsWith('var(') ? 'var(--accent-border-subtle)' : `${statusCfg.color}25`}`,
        }}
      >
        <StatusIcon className="w-2.5 h-2.5" />
        {statusCfg.label}
      </span>
      <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/25 shrink-0">
        <Calendar className="w-3 h-3" />
        {new Date(sub.nextBilling).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
    </motion.div>
  );
}
