import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle2,
  MessageCircle,
  Car,
  Palette,
  Disc3,
  Sun,
  Volume2,
} from 'lucide-react';
import { getDemoLeads, type DemoLead } from '../../data/dashboardDemo';

type StatusFilter = 'all' | 'pending' | 'contacted' | 'completed';

const STATUS_CONFIG = {
  pending: { label: 'New', color: '#FF4500', bg: '#FF4500', icon: Circle },
  contacted: { label: 'Contacted', color: '#3B82F6', bg: '#3B82F6', icon: MessageCircle },
  completed: { label: 'Completed', color: '#10B981', bg: '#10B981', icon: CheckCircle2 },
} as const;

export default function DashboardLeads() {
  const [leads, setLeads] = useState<DemoLead[]>(() => getDemoLeads());
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return leads;
    return leads.filter((l) => l.status === filter);
  }, [leads, filter]);

  const counts = useMemo(() => ({
    all: leads.length,
    pending: leads.filter((l) => l.status === 'pending').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    completed: leads.filter((l) => l.status === 'completed').length,
  }), [leads]);

  const updateStatus = (id: string, status: DemoLead['status']) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-white">Quote Leads</h2>
        <p className="text-sm text-white/40 mt-1">Manage incoming quote requests from customers.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {(['all', 'pending', 'contacted', 'completed'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              filter === f
                ? 'bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500]'
                : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
            <span className="ml-1.5 text-[10px] opacity-60">{counts[f]}</span>
          </button>
        ))}
      </motion.div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-white/25">No leads match this filter.</p>
          </div>
        ) : (
          filtered.map((lead, i) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              index={i}
              expanded={expandedId === lead.id}
              onToggle={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              onUpdateStatus={updateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  index,
  expanded,
  onToggle,
  onUpdateStatus,
}: {
  lead: DemoLead;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: string, status: DemoLead['status']) => void;
}) {
  const status = STATUS_CONFIG[lead.status];
  const StatusIcon = status.icon;
  const date = new Date(lead.created_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const configItems = [
    { icon: Car, label: 'Car', value: lead.car_config.car },
    { icon: Palette, label: 'Wrap', value: lead.car_config.wrap },
    { icon: Disc3, label: 'Wheels', value: lead.car_config.wheels },
    { icon: Sun, label: 'Tint', value: lead.car_config.tint },
    { icon: Volume2, label: 'Exhaust', value: lead.car_config.exhaust },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.03 }}
      className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white/50">
            {lead.customer_name.split(' ').map((w) => w[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white/80 truncate">{lead.customer_name}</p>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0"
              style={{
                backgroundColor: `${status.bg}15`,
                color: status.color,
                border: `1px solid ${status.bg}25`,
              }}
            >
              <StatusIcon className="w-2.5 h-2.5" />
              {status.label}
            </span>
          </div>
          <p className="text-[10px] text-white/25 truncate">{lead.car_config.car} &middot; {dateStr} at {timeStr}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-white/20 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/20 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.06]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 mb-4">
                <InfoRow icon={Mail} label="Email" value={lead.customer_email} />
                <InfoRow icon={Phone} label="Phone" value={lead.customer_phone} />
                <InfoRow icon={MapPin} label="Location" value={lead.customer_city} />
                <InfoRow icon={Clock} label="Best Time" value={lead.contact_time} />
              </div>

              {lead.notes && (
                <div className="mb-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-white/50 leading-relaxed">{lead.notes}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Build Configuration</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {configItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <Icon className="w-3 h-3 text-white/20 shrink-0" />
                        <span className="text-[10px] text-white/30 w-10 shrink-0">{item.label}</span>
                        <span className="text-xs text-white/60 truncate">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <p className="text-[10px] text-white/30 uppercase tracking-wider w-full mb-0.5">Update Status</p>
                {(['pending', 'contacted', 'completed'] as const).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const active = lead.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => onUpdateStatus(lead.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${
                        active
                          ? 'opacity-100'
                          : 'opacity-40 hover:opacity-70'
                      }`}
                      style={{
                        backgroundColor: `${cfg.bg}${active ? '20' : '10'}`,
                        color: cfg.color,
                        border: `1px solid ${cfg.bg}${active ? '30' : '15'}`,
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
                <a
                  href={`mailto:${lead.customer_email}?subject=Re: Your Quote Request&body=Hi ${lead.customer_name.split(' ')[0]},%0D%0A%0D%0AThank you for your interest in our services.`}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.1] transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <Mail className="w-3 h-3" />
                  Reply via Email
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <Icon className="w-3.5 h-3.5 text-white/20 shrink-0" />
      <span className="text-[10px] text-white/30 w-14 shrink-0">{label}</span>
      <span className="text-xs text-white/60 truncate">{value}</span>
    </div>
  );
}
