import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Store, Users, FileText, DollarSign, TrendingUp, UserPlus, Clock, CheckCircle2 } from 'lucide-react';
import { getAdminStats, getMonthlyRevenue, getWeeklySignups } from '../../data/adminDemo';

export default function AdminOverview() {
  const stats = useMemo(() => getAdminStats(), []);
  const revenue = useMemo(() => getMonthlyRevenue(), []);
  const signups = useMemo(() => getWeeklySignups(), []);

  const cards = [
    { label: 'Total Shops', value: stats.totalShops, icon: Store, color: '#FF4500', change: '+3 this month' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#3B82F6', change: '+8 this month' },
    { label: 'Leads This Month', value: stats.totalLeads, icon: FileText, color: '#10B981', change: '+12% vs last' },
    { label: 'Monthly Revenue', value: `$${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: '#F59E0B', change: '+18% vs last' },
    { label: 'New This Week', value: stats.newSignupsThisWeek, icon: UserPlus, color: '#06B6D4', change: 'shops + users' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: '#EF4444', change: 'needs review' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-xl font-bold text-white">Platform Overview</h2>
        <p className="text-sm text-white/40 mt-1">Key metrics across the entire NextGen platform.</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {cards.map((card, i) => {
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
                style={{ backgroundColor: `${card.color}15`, border: `1px solid ${card.color}25` }}
              >
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{card.label}</p>
              <p className="text-[9px] text-white/20 mt-1">{card.change}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Revenue by Plan</h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Starter
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="w-2 h-2 rounded-full bg-[#FF4500]" /> Pro
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Elite
              </span>
            </div>
          </div>
          <RevenueChart data={revenue} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-5">Weekly Signups</h3>
          <div className="space-y-4">
            {signups.map((week, i) => {
              const total = week.shops + week.users;
              const maxTotal = Math.max(...signups.map((w) => w.shops + w.users));
              const pct = (total / maxTotal) * 100;
              return (
                <div key={week.week}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/40 font-medium">{week.week}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#FF4500]">{week.shops} shops</span>
                      <span className="text-[10px] text-[#3B82F6]">{week.users} users</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#FF4500] to-[#3B82F6]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
      >
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Clock, label: 'Pending Approvals', count: stats.pendingApprovals, color: '#EF4444' },
            { icon: TrendingUp, label: 'Active Subscriptions', count: stats.activeSubscriptions, color: '#10B981' },
            { icon: CheckCircle2, label: 'Total Shops', count: stats.totalShops, color: '#FF4500' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${action.color}10`, border: `1px solid ${action.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{action.count}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{action.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function RevenueChart({ data }: { data: { month: string; starter: number; professional: number; elite: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.starter + d.professional + d.elite));

  return (
    <div className="flex items-end gap-4 h-44">
      {data.map((d) => {
        const total = d.starter + d.professional + d.elite;
        const starterH = (d.starter / maxVal) * 100;
        const proH = (d.professional / maxVal) * 100;
        const eliteH = (d.elite / maxVal) * 100;

        return (
          <div key={d.month} className="flex-1 flex flex-col items-center group relative">
            <div className="absolute bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="bg-[#1a1a1a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-lg">
                <p className="text-white/60 font-medium mb-0.5">{d.month}</p>
                <p className="text-[#3B82F6]">Starter: ${d.starter}</p>
                <p className="text-[#FF4500]">Pro: ${d.professional}</p>
                <p className="text-[#10B981]">Elite: ${d.elite}</p>
                <p className="text-white/40 mt-0.5 border-t border-white/[0.06] pt-0.5">Total: ${total}</p>
              </div>
            </div>
            <div className="w-full flex flex-col gap-[2px] items-stretch h-36 justify-end">
              <div
                className="rounded-t bg-[#10B981]/50 hover:bg-[#10B981]/70 transition-colors"
                style={{ height: `${eliteH}%`, minHeight: 2 }}
              />
              <div
                className="bg-[#FF4500]/50 hover:bg-[#FF4500]/70 transition-colors"
                style={{ height: `${proH}%`, minHeight: 2 }}
              />
              <div
                className="rounded-b bg-[#3B82F6]/40 hover:bg-[#3B82F6]/60 transition-colors"
                style={{ height: `${starterH}%`, minHeight: 2 }}
              />
            </div>
            <span className="text-[9px] text-white/25 mt-2 font-medium">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}
