import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  Star,
  CreditCard,
  UserPlus,
  ArrowUpRight,
} from 'lucide-react';
import {
  getAdminStats,
  getRecentActivity,
  getLeadStatusBreakdown,
  getEngagementData,
  type ActivityEvent,
} from '../../data/adminDemo';

const ACTIVITY_ICONS: Record<ActivityEvent['type'], React.ElementType> = {
  config: Settings,
  lead: FileText,
  signup: UserPlus,
  review: Star,
  payment: CreditCard,
};

const ACTIVITY_COLORS: Record<ActivityEvent['type'], string> = {
  config: '#3B82F6',
  lead: '#FF4500',
  signup: '#10B981',
  review: '#F59E0B',
  payment: '#8B5CF6',
};

export default function AdminOverview() {
  const stats = useMemo(() => getAdminStats(), []);
  const activity = useMemo(() => getRecentActivity(), []);
  const leadBreakdown = useMemo(() => getLeadStatusBreakdown(), []);
  const engagement = useMemo(() => getEngagementData(), []);

  const cards = [
    { label: 'Total Leads', value: stats.totalLeads.toString(), icon: FileText, color: '#FF4500', trend: '+12%', trendLabel: 'this week' },
    { label: 'Revenue Pipeline', value: `$${(stats.monthlyRevenue * 12).toLocaleString()}`, icon: DollarSign, color: '#10B981', trend: '+18%', trendLabel: 'this month' },
    { label: 'Active Configs', value: '247', icon: Activity, color: '#3B82F6', trend: '+5%', trendLabel: 'this week' },
    { label: 'Conversion Rate', value: '24.8%', icon: TrendingUp, color: '#F59E0B', trend: '+3.2%', trendLabel: 'vs last month' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back. Here's your platform overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-5 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/30 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}10` }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[11px] font-semibold">{card.trend}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{card.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{card.trendLabel}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lead Status Breakdown</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Current pipeline distribution</p>
            </div>
            <div className="flex items-center gap-3">
              {leadBreakdown.map((item) => (
                <span key={item.status} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.status}
                </span>
              ))}
            </div>
          </div>
          <LeadStatusChart data={leadBreakdown} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Engagement Over Time</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Weekly platform activity</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#FF4500]" /> Configs
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Leads
              </span>
            </div>
          </div>
          <EngagementChart data={engagement} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Live platform events</p>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div className="space-y-1">
          {activity.map((event, i) => {
            const Icon = ACTIVITY_ICONS[event.type];
            const color = ACTIVITY_COLORS[event.type];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}10` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">{event.actor}</span>
                    {' '}{event.message}
                  </p>
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 shrink-0">{event.timestamp}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function LeadStatusChart({ data }: { data: { status: string; count: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count));
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-end gap-6 h-48 px-2">
      {data.map((d, i) => {
        const pct = (d.count / maxCount) * 100;
        const isHovered = hovered === i;
        return (
          <div
            key={d.status}
            className="flex-1 flex flex-col items-center relative"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHovered && (
              <div className="absolute bottom-full mb-3 z-10">
                <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap">
                  <p className="font-semibold">{d.status}</p>
                  <p className="text-gray-300">{d.count} leads ({Math.round((d.count / total) * 100)}%)</p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 -mt-1" />
                </div>
              </div>
            )}
            <div className="w-full flex justify-center h-40">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-12 rounded-t-xl transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: isHovered ? d.color : `${d.color}CC`,
                  boxShadow: isHovered ? `0 4px 20px ${d.color}40` : 'none',
                }}
              />
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{d.status}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{d.count}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EngagementChart({ data }: { data: { day: string; configurations: number; leads: number; signups: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.configurations));
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-end gap-3 h-48 px-1">
      {data.map((d, i) => {
        const configPct = (d.configurations / maxVal) * 100;
        const leadPct = (d.leads / maxVal) * 100;
        const isHovered = hovered === i;
        return (
          <div
            key={d.day}
            className="flex-1 flex flex-col items-center relative"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHovered && (
              <div className="absolute bottom-full mb-3 z-10">
                <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap">
                  <p className="font-semibold mb-1">{d.day}</p>
                  <p className="text-[#FF4500]">{d.configurations} configurations</p>
                  <p className="text-[#3B82F6]">{d.leads} leads</p>
                  <p className="text-gray-300">{d.signups} signups</p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 -mt-1" />
                </div>
              </div>
            )}
            <div className="w-full flex items-end justify-center gap-1.5 h-40">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${configPct}%` }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-5 rounded-t-lg cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: isHovered ? '#FF4500' : '#FF450099',
                  boxShadow: isHovered ? '0 4px 12px #FF450040' : 'none',
                }}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${leadPct}%` }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-5 rounded-t-lg cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: isHovered ? '#3B82F6' : '#3B82F699',
                  boxShadow: isHovered ? '0 4px 12px #3B82F640' : 'none',
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">{d.day}</p>
          </div>
        );
      })}
    </div>
  );
}
