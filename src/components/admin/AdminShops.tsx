import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, MapPin, Star, FileText, CheckCircle2, XCircle, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { getAdminShops, type AdminShop } from '../../data/adminDemo';

type StatusFilter = 'all' | 'active' | 'pending' | 'suspended';
type PlanFilter = 'all' | 'starter' | 'professional' | 'elite';
type SortField = 'name' | 'leads' | 'rating' | 'joinDate';

const STATUS_STYLES = {
  active: { label: 'Active', color: '#10B981', icon: CheckCircle2 },
  pending: { label: 'Pending', color: '#F59E0B', icon: AlertTriangle },
  suspended: { label: 'Suspended', color: '#EF4444', icon: XCircle },
} as const;

const PLAN_STYLES = {
  starter: { label: 'Starter', color: '#3B82F6' },
  professional: { label: 'Professional', color: '#FF4500' },
  elite: { label: 'Elite', color: '#10B981' },
} as const;

export default function AdminShops() {
  const [shops, setShops] = useState<AdminShop[]>(() => getAdminShops());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = shops;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.owner.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter((s) => s.status === statusFilter);
    if (planFilter !== 'all') result = result.filter((s) => s.plan === planFilter);

    result = [...result].sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'leads') return (a.leads - b.leads) * dir;
      if (sortField === 'rating') return (a.rating - b.rating) * dir;
      return a.joinDate.localeCompare(b.joinDate) * dir;
    });
    return result;
  }, [shops, search, statusFilter, planFilter, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const updateStatus = (id: string, status: AdminShop['status']) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const updatePlan = (id: string, plan: string) => {
    const prices: Record<string, number> = { starter: 29, professional: 79, elite: 149 };
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, plan, revenue: prices[plan] || 0 } : s)));
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl font-bold text-white">Shop Management</h2>
        <p className="text-sm text-white/40 mt-1">View, approve, and manage all registered shops.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search shops, owners, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF4500]/30 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'pending', 'suspended'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                statusFilter === f
                  ? 'bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'starter', 'professional', 'elite'] as PlanFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPlanFilter(f)}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                planFilter === f
                  ? 'bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'all' ? 'All Plans' : f}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="hidden sm:grid grid-cols-[2fr_1fr_1fr_80px_80px_80px] gap-3 px-4 py-2 mb-2"
      >
        <SortHeader label="Shop" field="name" currentField={sortField} asc={sortAsc} onToggle={toggleSort} />
        <span className="text-[10px] text-white/20 uppercase tracking-wider font-semibold">Plan</span>
        <span className="text-[10px] text-white/20 uppercase tracking-wider font-semibold">Status</span>
        <SortHeader label="Leads" field="leads" currentField={sortField} asc={sortAsc} onToggle={toggleSort} />
        <SortHeader label="Rating" field="rating" currentField={sortField} asc={sortAsc} onToggle={toggleSort} />
        <SortHeader label="Joined" field="joinDate" currentField={sortField} asc={sortAsc} onToggle={toggleSort} />
      </motion.div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-white/25">No shops match your search.</p>
          </div>
        ) : (
          filtered.map((shop, i) => (
            <ShopRow
              key={shop.id}
              shop={shop}
              index={i}
              expanded={expandedId === shop.id}
              onToggle={() => setExpandedId(expandedId === shop.id ? null : shop.id)}
              onUpdateStatus={updateStatus}
              onUpdatePlan={updatePlan}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SortHeader({ label, field, currentField, asc, onToggle }: { label: string; field: SortField; currentField: SortField; asc: boolean; onToggle: (f: SortField) => void }) {
  const active = currentField === field;
  return (
    <button
      onClick={() => onToggle(field)}
      className="flex items-center gap-1 text-[10px] text-white/20 uppercase tracking-wider font-semibold hover:text-white/40 transition-colors"
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${active ? 'text-[#FF4500]/60' : ''}`} />
    </button>
  );
}

function ShopRow({
  shop,
  index,
  expanded,
  onToggle,
  onUpdateStatus,
  onUpdatePlan,
}: {
  shop: AdminShop;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: string, status: AdminShop['status']) => void;
  onUpdatePlan: (id: string, plan: string) => void;
}) {
  const statusCfg = STATUS_STYLES[shop.status];
  const StatusIcon = statusCfg.icon;
  const planCfg = PLAN_STYLES[shop.plan as keyof typeof PLAN_STYLES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 + index * 0.02 }}
      className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_80px_80px_80px] gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors items-center"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white/50">
              {shop.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/80 truncate">{shop.name}</p>
            <p className="text-[10px] text-white/25 truncate">{shop.owner} &middot; {shop.email}</p>
          </div>
          <div className="sm:hidden ml-auto">
            {expanded ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
          </div>
        </div>
        <div className="hidden sm:block">
          <span
            className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${planCfg.color}15`, color: planCfg.color, border: `1px solid ${planCfg.color}25` }}
          >
            {planCfg.label}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <StatusIcon className="w-3 h-3" style={{ color: statusCfg.color }} />
          <span className="text-xs font-medium" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
        </div>
        <span className="hidden sm:block text-xs text-white/50">{shop.leads}</span>
        <span className="hidden sm:flex items-center gap-1 text-xs text-white/50">
          <Star className="w-3 h-3 text-[#F59E0B]" />{shop.rating}
        </span>
        <span className="hidden sm:block text-[10px] text-white/30">{new Date(shop.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
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
            <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoBlock label="Location" value={`${shop.city}, ${shop.state}`} icon={MapPin} />
                <InfoBlock label="Monthly Revenue" value={`$${shop.revenue}`} icon={FileText} />
                <InfoBlock label="Rating" value={`${shop.rating}/5`} icon={Star} />
                <InfoBlock label="Total Leads" value={String(shop.leads)} icon={FileText} />
              </div>

              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['active', 'pending', 'suspended'] as const).map((s) => {
                    const cfg = STATUS_STYLES[s];
                    const active = shop.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => onUpdateStatus(shop.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${active ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                        style={{
                          backgroundColor: `${cfg.color}${active ? '20' : '10'}`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}${active ? '30' : '15'}`,
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Change Plan</p>
                <div className="flex flex-wrap gap-2">
                  {(['starter', 'professional', 'elite'] as const).map((p) => {
                    const cfg = PLAN_STYLES[p];
                    const active = shop.plan === p;
                    return (
                      <button
                        key={p}
                        onClick={() => onUpdatePlan(shop.id, p)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${active ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                        style={{
                          backgroundColor: `${cfg.color}${active ? '20' : '10'}`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}${active ? '30' : '15'}`,
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoBlock({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <Icon className="w-3.5 h-3.5 text-white/20 shrink-0" />
      <div>
        <p className="text-[10px] text-white/25 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-white/60 font-medium">{value}</p>
      </div>
    </div>
  );
}
