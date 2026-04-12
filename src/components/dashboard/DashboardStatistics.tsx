import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Eye, FileText, Star, MessageSquareQuote, Users, ArrowUpRight } from 'lucide-react';
import type { Shop } from '../../types';
import { getDemoMetrics, type DailyMetric } from '../../data/dashboardDemo';

const STATUS_CATEGORIES = [
  { label: 'New', value: 120, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
  { label: 'Contacted', value: 80, color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #67E8F9)' },
  { label: 'Qualified', value: 40, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #6EE7B7)' },
  { label: 'Won', value: 25, color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)' },
  { label: 'Lost', value: 15, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #FCA5A5)' },
];

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
    { label: 'Total Leads', value: totalLeads.toLocaleString(), change: `+${leadsChange}%`, up: true, icon: FileText, color: 'var(--accent)' },
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

  const totalStatusLeads = STATUS_CATEGORIES.reduce((s, c) => s + c.value, 0);
  const statusConversion = ((STATUS_CATEGORIES.find(c => c.label === 'Won')?.value || 0) / totalStatusLeads * 100).toFixed(1);

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
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
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
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Engagement Over Time</h3>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }} /> Views
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/30">
                <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }} /> Leads
              </span>
            </div>
          </div>
          <EngagementChart metrics={metrics} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Lead Status Breakdown</h3>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <span className="text-[10px] text-white/30">{totalStatusLeads} total leads</span>
            <span className="text-[10px] text-emerald-400 font-medium">{statusConversion}% conversion</span>
            <span className="text-[10px] text-white/20">Last updated: Apr 7</span>
          </div>
          <StatusBreakdownChart />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-5">Weekly Breakdown</h3>
          <WeeklyBreakdownChart data={weeklyData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
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
    </div>
  );
}

function EngagementChart({ metrics }: { metrics: DailyMetric[] }) {
  const maxViews = Math.max(...metrics.map((m) => m.views));
  const maxLeads = Math.max(...metrics.map((m) => m.leads));
  const chartMax = Math.max(maxViews, maxLeads * 5);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const gridValues = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-36 flex flex-col justify-between pointer-events-none">
        {gridValues.map((pct) => (
          <div key={pct} className="flex items-center gap-2">
            <span className="text-[8px] text-white/15 w-6 text-right tabular-nums shrink-0">
              {Math.round(chartMax * (1 - pct))}
            </span>
            <div className="flex-1 border-b border-white/[0.04]" />
          </div>
        ))}
      </div>

      <div className="flex items-end gap-[2px] h-44 pl-8 relative">
        {metrics.map((m, i) => {
          const viewH = (m.views / chartMax) * 100;
          const leadH = (m.leads / chartMax) * 100 * 5;
          const showLabel = i % 5 === 0 || i === metrics.length - 1;
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={m.date}
              className="flex-1 flex flex-col items-center gap-0.5 relative"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute bottom-full mb-2 pointer-events-none z-20">
                  <div className="bg-[#1a1a1a] light:bg-white border border-white/[0.1] light:border-gray-200 rounded-xl px-3.5 py-2.5 text-[10px] whitespace-nowrap shadow-2xl light:shadow-lg light:shadow-black/10">
                    <p className="text-white/60 light:text-gray-500 font-semibold mb-1.5">{m.label}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }} />
                      <span className="text-[#60A5FA] font-bold">{m.views}</span>
                      <span className="text-white/30">views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }} />
                      <span className="text-[#6EE7B7] font-bold">{m.leads}</span>
                      <span className="text-white/30">leads</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="w-full flex gap-[1px] items-end h-36">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${viewH}%` }}
                  transition={{ delay: 0.05 + i * 0.015, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 rounded-t-[6px] transition-all duration-200"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(180deg, #60A5FA, #3B82F6)'
                      : 'linear-gradient(180deg, rgba(96, 165, 250, 0.5), rgba(59, 130, 246, 0.25))',
                    minHeight: 2,
                    boxShadow: isHovered ? '0 0 12px rgba(59, 130, 246, 0.3)' : 'none',
                  }}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${leadH}%` }}
                  transition={{ delay: 0.08 + i * 0.015, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 rounded-t-[6px] transition-all duration-200"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(180deg, #6EE7B7, #10B981)'
                      : 'linear-gradient(180deg, rgba(110, 231, 183, 0.5), rgba(16, 185, 129, 0.25))',
                    minHeight: 2,
                    boxShadow: isHovered ? '0 0 12px rgba(16, 185, 129, 0.3)' : 'none',
                  }}
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

function StatusBreakdownChart() {
  const sorted = [...STATUS_CATEGORIES].sort((a, b) => b.value - a.value);
  const maxVal = sorted[0].value;
  const totalVal = STATUS_CATEGORIES.reduce((s, c) => s + c.value, 0);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {sorted.map((cat, i) => {
        const pct = (cat.value / maxVal) * 100;
        const share = ((cat.value / totalVal) * 100).toFixed(0);
        const isHovered = hoveredLabel === cat.label;
        return (
          <div
            key={cat.label}
            className="group cursor-default"
            onMouseEnter={() => setHoveredLabel(cat.label)}
            onMouseLeave={() => setHoveredLabel(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-[4px] shrink-0"
                  style={{ background: cat.gradient }}
                />
                <span className={`text-xs font-medium transition-colors duration-200 ${isHovered ? 'text-white/80' : 'text-white/50'}`}>
                  {cat.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold tabular-nums transition-colors duration-200 ${isHovered ? 'text-white' : 'text-white/70'}`}>
                  {cat.value}
                </span>
                <span className="text-[10px] text-white/25 w-10 text-right tabular-nums">
                  {share}%
                </span>
              </div>
            </div>
            <div className="h-5 bg-white/[0.04] rounded-lg overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-lg relative transition-all duration-200"
                style={{
                  background: cat.gradient,
                  opacity: isHovered ? 1 : 0.75,
                  boxShadow: isHovered ? `0 0 16px ${cat.color}40` : 'none',
                }}
              >
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow-sm">
                  {cat.value}
                </span>
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeeklyBreakdownChart({ data }: { data: { label: string; views: number; leads: number }[] }) {
  const maxViews = Math.max(...data.map((w) => w.views));
  const maxLeads = Math.max(...data.map((w) => w.leads));
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {data.map((week, i) => {
        const viewPct = (week.views / maxViews) * 100;
        const leadPct = (week.leads / maxLeads) * 100;
        const isHovered = hoveredIdx === i;
        return (
          <div
            key={week.label}
            className="relative"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium transition-colors duration-200 ${isHovered ? 'text-white/70' : 'text-white/40'}`}>
                {week.label}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-[#60A5FA] font-semibold tabular-nums">{week.views} views</span>
                <span className="text-[11px] text-[#6EE7B7] font-semibold tabular-nums">{week.leads} leads</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-4 bg-white/[0.04] rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${viewPct}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-lg relative transition-all duration-200"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                      : 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(96, 165, 250, 0.35))',
                    boxShadow: isHovered ? '0 0 12px rgba(59, 130, 246, 0.25)' : 'none',
                  }}
                >
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white/90 drop-shadow-sm">
                    {week.views}
                  </span>
                </motion.div>
              </div>
              <div className="h-3.5 bg-white/[0.04] rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${leadPct}%` }}
                  transition={{ delay: 0.45 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-lg relative transition-all duration-200"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(90deg, #10B981, #6EE7B7)'
                      : 'linear-gradient(90deg, rgba(16, 185, 129, 0.5), rgba(110, 231, 183, 0.35))',
                    boxShadow: isHovered ? '0 0 12px rgba(16, 185, 129, 0.25)' : 'none',
                  }}
                >
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white/90 drop-shadow-sm">
                    {week.leads}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
