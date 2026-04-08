import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Store, Car, TrendingUp, Users, BarChart3, Circle, MessageCircle, CheckCircle2 } from 'lucide-react';
import { getAdminLeads, getAdminShops, type AdminLead } from '../../data/adminDemo';

const STATUS_STYLES = {
  pending: { label: 'Pending', color: '#FF4500', icon: Circle },
  contacted: { label: 'Contacted', color: '#3B82F6', icon: MessageCircle },
  completed: { label: 'Completed', color: '#10B981', icon: CheckCircle2 },
} as const;

export default function AdminLeads() {
  const leads = useMemo(() => getAdminLeads(), []);
  const shops = useMemo(() => getAdminShops(), []);

  const totalLeads = leads.length;
  const pendingLeads = leads.filter((l) => l.status === 'pending').length;
  const contactedLeads = leads.filter((l) => l.status === 'contacted').length;
  const completedLeads = leads.filter((l) => l.status === 'completed').length;

  const shopLeadCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.shopName] = (counts[l.shopName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
  }, [leads]);

  const carPopularity = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.car] = (counts[l.car] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [leads]);

  const statCards = [
    { label: 'Total Leads', value: totalLeads, icon: FileText, color: '#FF4500' },
    { label: 'Pending', value: pendingLeads, icon: Circle, color: '#F59E0B' },
    { label: 'Contacted', value: contactedLeads, icon: MessageCircle, color: '#3B82F6' },
    { label: 'Completed', value: completedLeads, icon: CheckCircle2, color: '#10B981' },
    { label: 'Active Shops', value: shops.filter((s) => s.status === 'active').length, icon: Store, color: '#06B6D4' },
    { label: 'Avg Leads/Shop', value: (totalLeads / shops.length).toFixed(1), icon: TrendingUp, color: '#8B5CF6' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl font-bold text-white">Leads & Analytics</h2>
        <p className="text-sm text-white/40 mt-1">Platform-wide lead generation and user activity insights.</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
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
          transition={{ delay: 0.3 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Store className="w-4 h-4 text-[#FF4500]/50" />
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Top Shops by Leads</h3>
          </div>
          <div className="space-y-3">
            {shopLeadCounts.map(([name, count], i) => {
              const maxCount = shopLeadCounts[0][1];
              const pct = (count / maxCount) * 100;
              return (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/50 font-medium truncate flex-1">{name}</span>
                    <span className="text-xs text-[#FF4500] font-bold ml-2">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#FF4500]/60 to-[#FF4500]"
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
          transition={{ delay: 0.35 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Car className="w-4 h-4 text-[#3B82F6]/50" />
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Most Popular Cars</h3>
          </div>
          <div className="space-y-3">
            {carPopularity.map(([car, count], i) => {
              const maxCount = carPopularity[0][1];
              const pct = (count / maxCount) * 100;
              return (
                <div key={car}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/50 font-medium">{car}</span>
                    <span className="text-xs text-[#3B82F6] font-bold">{count} leads</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#3B82F6]/60 to-[#3B82F6]"
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
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-white/30" />
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Recent Leads</h3>
        </div>
        <div className="space-y-2">
          {leads.slice(0, 8).map((lead, i) => {
            const statusCfg = STATUS_STYLES[lead.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={lead.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 font-medium truncate">{lead.customer}</p>
                  <p className="text-[10px] text-white/25 truncate">{lead.shopName} &middot; {lead.car}</p>
                </div>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0"
                  style={{ backgroundColor: `${statusCfg.color}15`, color: statusCfg.color, border: `1px solid ${statusCfg.color}25` }}
                >
                  <StatusIcon className="w-2.5 h-2.5" />
                  {statusCfg.label}
                </span>
                <span className="text-[10px] text-white/20 shrink-0 hidden sm:block">
                  {new Date(lead.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
