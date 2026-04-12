import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, FileText, Star, MessageSquareQuote, ExternalLink } from 'lucide-react';
import type { Shop } from '../../types';
import { getDemoStats, getDemoMetrics, type DailyMetric } from '../../data/dashboardDemo';

interface DashboardOverviewProps {
  shop: Shop;
  onPreviewShop?: () => void;
}

export default function DashboardOverview({ shop, onPreviewShop }: DashboardOverviewProps) {
  const stats = useMemo(() => getDemoStats(), []);
  const metrics = useMemo(() => getDemoMetrics(), []);

  const cards = [
    { label: 'Leads This Month', value: stats.leadsThisMonth, icon: TrendingUp, color: 'var(--accent)' },
    { label: 'Profile Views', value: stats.viewsThisMonth, icon: Eye, color: '#3B82F6' },
    { label: 'Avg Rating', value: shop.rating.toFixed(1), icon: Star, color: '#F59E0B' },
    { label: 'Total Reviews', value: shop.reviews, icon: MessageSquareQuote, color: '#10B981' },
    { label: 'Quote Requests', value: stats.totalQuoteRequests, icon: FileText, color: '#8B5CF6' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-white">Welcome back</h2>
        <p className="text-sm text-white/40 mt-1">
          Here's what's happening with <span className="text-white/60 font-medium">{shop.name}</span> this month.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-8"
      >
        <button
          onClick={onPreviewShop}
          className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm font-semibold hover:bg-white/[0.07] hover:text-white hover:border-white/[0.12] transition-all duration-200 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center shrink-0 group-hover:bg-[#FF4500]/15 transition-colors">
            <Eye className="w-4 h-4 text-[#FF4500]" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-white/70 group-hover:text-white transition-colors">Preview My Shop</span>
            <span className="block text-[10px] text-white/30">See your profile as customers see it</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-white/20 ml-auto group-hover:text-white/50 transition-colors" />
        </button>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Last 30 Days
          </h3>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[10px] text-white/30">
              <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #10B981, #6EE7B7)' }} /> Leads
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-white/30">
              <span className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }} /> Views
            </span>
          </div>
        </div>
        <MetricsChart metrics={metrics} />
      </motion.div>
    </div>
  );
}

function MetricsChart({ metrics }: { metrics: DailyMetric[] }) {
  const maxViews = Math.max(...metrics.map((m) => m.views));
  const maxLeads = Math.max(...metrics.map((m) => m.leads));
  const chartMax = Math.max(maxViews, maxLeads * 5);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-32 flex flex-col justify-between pointer-events-none">
        {[0, 0.25, 0.5, 0.75, 1.0].map((pct) => (
          <div key={pct} className="flex items-center gap-2">
            <span className="text-[8px] text-white/15 w-6 text-right tabular-nums shrink-0">
              {Math.round(chartMax * (1 - pct))}
            </span>
            <div className="flex-1 border-b border-white/[0.04]" />
          </div>
        ))}
      </div>
      <div className="flex items-end gap-[2px] h-40 pl-8 relative">
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
              <div className="w-full flex gap-[1px] items-end h-32">
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
