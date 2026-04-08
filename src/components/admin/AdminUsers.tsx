import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, CheckCircle2, XCircle, FolderOpen, Store, Calendar } from 'lucide-react';
import { getAdminUsers, type AdminUser } from '../../data/adminDemo';

type StatusFilter = 'all' | 'active' | 'suspended';
type RoleFilter = 'all' | 'user' | 'shopOwner';

const STATUS_STYLES = {
  active: { label: 'Active', color: '#10B981', icon: CheckCircle2 },
  suspended: { label: 'Suspended', color: '#EF4444', icon: XCircle },
} as const;

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(() => getAdminUsers());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter((u) => u.status === statusFilter);
    if (roleFilter === 'shopOwner') result = result.filter((u) => u.isShopOwner);
    if (roleFilter === 'user') result = result.filter((u) => !u.isShopOwner);
    return result;
  }, [users, search, statusFilter, roleFilter]);

  const updateStatus = (id: string, status: AdminUser['status']) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        <p className="text-sm text-white/40 mt-1">View and manage all registered users on the platform.</p>
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
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF4500]/30 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'suspended'] as StatusFilter[]).map((f) => (
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
          {(['all', 'user', 'shopOwner'] as RoleFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                roleFilter === f
                  ? 'bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'all' ? 'All Roles' : f === 'shopOwner' ? 'Shop Owners' : 'Users'}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-white/25">No users match your search.</p>
          </div>
        ) : (
          filtered.map((user, i) => (
            <UserRow
              key={user.id}
              user={user}
              index={i}
              expanded={expandedId === user.id}
              onToggle={() => setExpandedId(expandedId === user.id ? null : user.id)}
              onUpdateStatus={updateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  index,
  expanded,
  onToggle,
  onUpdateStatus,
}: {
  user: AdminUser;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: string, status: AdminUser['status']) => void;
}) {
  const statusCfg = STATUS_STYLES[user.status];
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 + index * 0.02 }}
      className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-white/50">
            {user.name.split(' ').map((w) => w[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white/80 truncate">{user.name}</p>
            {user.isShopOwner && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-[#FF4500]/70 bg-[#FF4500]/10 border border-[#FF4500]/15">
                SHOP OWNER
              </span>
            )}
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0"
              style={{ backgroundColor: `${statusCfg.color}15`, color: statusCfg.color, border: `1px solid ${statusCfg.color}25` }}
            >
              <StatusIcon className="w-2.5 h-2.5" />
              {statusCfg.label}
            </span>
          </div>
          <p className="text-[10px] text-white/25 truncate">{user.email}</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-white/30 shrink-0">
          <span className="flex items-center gap-1"><FolderOpen className="w-3 h-3" /> {user.builds} builds</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/20 shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/20 shrink-0" />}
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
                <InfoBlock label="Email" value={user.email} />
                <InfoBlock label="Saved Builds" value={String(user.builds)} icon={FolderOpen} />
                <InfoBlock label="Joined" value={new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} icon={Calendar} />
                <InfoBlock label="Role" value={user.isShopOwner ? 'Shop Owner' : 'Customer'} icon={Store} />
              </div>

              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['active', 'suspended'] as const).map((s) => {
                    const cfg = STATUS_STYLES[s];
                    const active = user.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => onUpdateStatus(user.id, s)}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InfoBlock({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      {Icon && <Icon className="w-3.5 h-3.5 text-white/20 shrink-0" />}
      <div className="min-w-0">
        <p className="text-[10px] text-white/25 uppercase tracking-wider">{label}</p>
        <p className="text-xs text-white/60 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
