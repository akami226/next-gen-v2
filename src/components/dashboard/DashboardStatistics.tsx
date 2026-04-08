import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, FileText, Star, MessageSquareQuote, Users, ArrowUpRight } from 'lucide-react';
import type { Shop } from '../../types';
import { getDemoMetrics, type DailyMetric } from '../../data/dashboardDemo';

export default function DashboardStatistics({ shop }: { shop: Shop }) {
  const metrics = useMemo(() => getDemoMetrics(), []);

  const totalViews = metrics.reduce((s, m) => s + m.views, 0);
  const totalLeads = metrics.reduce((s, m) => s + m.leads, 0);
  const avgDailyViews = Math.round(totalViews / metrics.length);
  const conversionRate = ((totalLeads / totalViews) * 100).toFixed(1);

  const prevViews = Math.round(totalViews * 0.82);
  const prevLeads = Math.round(totalLeads * 0.75);
  const viewsChange = ((totalViews - prevViews) / prevViews * 100).toFixed(0);
  const leadsChange = ((totalLeads - prevLeads) / prevLeads * 100).toFixed(0);

  const statCards = [
    { label: 'Total Views', value: totalViews.toLocaleString(), change: `+${viewsChange}%`, up: true, icon: Eye, color: '#3B82F6' },
    { label: 'Total Leads', value: totalLeads.toLocaleString(), change: `+${leadsChange}%`, up: true, icon: FileText, color: '#FF4500' },
    { label: 'Avg Daily Views', value: avgDailyViews.toLocaleString(), change: '+12%', up: true, icon: Users, color: '#10B981' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, change: '+0.8%', up: true, icon: ArrowUpRight, color: '#F59E0B' },
    { label: 'Avg Rating', value: shop.rating.toFixed(1), change: '+0.2', up: true, icon: Star, color: '#F59E0B' },
    { label: 'Total Reviews', value: shop.reviews.toLocaleString(), change: '+3', up: true, icon: MessageSquareQuote, color: '#10B981' },
  ];

  const weeklyData = useMemo(() => {
    const weeks: { label: string; views: number; leads: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const slice = metrics.slice(w * 7, (w + 1) * 7);
      weeks.push({
        label: `Week ${w + 1}`,
        views: slice.reduce((s, m) => s + m.views, 0),
        leads: slice.reduce((s, m) => s + m.leads, 0),
      });
    }
    return weeks;
  }, [metrics]);

  const topDays = useMemo(() => {
    return [...metrics].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [metrics]);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl font-bold text-white">Statistics</h2>
        <p className="text-sm text-white/40 mt-1">Performance overview for the last 30 days</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
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
                style={{ backgroundColor: `${card.color}15`, border: `1px solid ${card.color}25` }}
              >
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <p className="text-xl font-black text-white tracking-tight">{card.value}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{card.label}</p>
              <div className="flex items-center gap-1 mt-2">
                {card.up ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className={`text-[10px] font-semibold ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change}
                </span>
                <span className="text-[9px] text-white/20">vs prev</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Daily Trends</h3>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Views
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="w-2 h-2 rounded-full bg-[#FF4500]" /> Leads
              </span>
            </div>
          </div>
          <DailyChart metrics={metrics} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-5">Weekly Breakdown</h3>
          <div className="space-y-4">
            {weeklyData.map((week, i) => {
              const maxViews = Math.max(...weeklyData.map((w) => w.views));
              const pct = (week.views / maxViews) * 100;
              return (
                <div key={week.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/40 font-medium">{week.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#3B82F6]">{week.views} views</span>
                      <span className="text-[10px] text-[#FF4500]">{week.leads} leads</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] to-[#FF4500]"
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
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Top Performing Days</h3>
        <div className="space-y-2">
          {topDays.map((day, i) => (
            <div
              key={day.date}
              className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
            >
              <span className="w-6 h-6 rounded-lg bg-[#FF4500]/10 flex items-center justify-center text-[10px] font-bold text-[#FF4500]">
                {i + 1}
              </span>
              <span className="text-sm text-white/50 font-medium flex-1">{day.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[#3B82F6]">
                  <Eye className="w-3 h-3 inline mr-1" />{day.views}
                </span>
                <span className="text-xs text-[#FF4500]">
                  <FileText className="w-3 h-3 inline mr-1" />{day.leads}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function DailyChart({ metrics }: { metrics: DailyMetric[] }) {
  const maxViews = Math.max(...metrics.map((m) => m.views));
  const maxLeads = Math.max(...metrics.map((m) => m.leads));
  const chartMax = Math.max(maxViews, maxLeads * 5);

  return (
    <div className="relative">
      <div className="flex items-end gap-[3px] h-44">
        {metrics.map((m, i) => {
          const viewH = (m.views / chartMax) * 100;
          const leadH = (m.leads / chartMax) * 100 * 5;
          const showLabel = i % 5 === 0 || i === metrics.length - 1;
          return (
            <div key={m.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
              <div className="absolute bottom-full mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-[#1a1a1a] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-lg">
                  <p className="text-white/60 font-medium mb-0.5">{m.label}</p>
                  <p className="text-[#3B82F6]">{m.views} views</p>
                  <p className="text-[#FF4500]">{m.leads} leads</p>
                </div>
              </div>
              <div className="w-full flex gap-[1px] items-end h-36">
                <div
                  className="flex-1 rounded-t bg-[#3B82F6]/40 hover:bg-[#3B82F6]/60 transition-colors"
                  style={{ height: `${viewH}%`, minHeight: 2 }}
                />
                <div
                  className="flex-1 rounded-t bg-[#FF4500]/50 hover:bg-[#FF4500]/70 transition-colors"
                  style={{ height: `${leadH}%`, minHeight: 2 }}
                />
              </div>
              {showLabel && (
                <span className="text-[8px] text-white/20 mt-1 truncate w-full text-center">
                  {m.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
