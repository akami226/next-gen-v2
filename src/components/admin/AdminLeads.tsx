import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Download,
  ChevronDown,
  Mail,
  Phone,
  Car,
  CheckCircle2,
} from 'lucide-react';
import { getAdminLeads, type AdminLead } from '../../data/adminDemo';

type StatusFilter = 'all' | 'new' | 'contacted' | 'qualified' | 'closed';

const STATUS_CONFIG: Record<AdminLead['status'], { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  contacted: { label: 'Contacted', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
  qualified: { label: 'Qualified', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  closed: { label: 'Closed', bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-500/20' },
};

export default function AdminLeads() {
  const allLeads = useMemo(() => getAdminLeads(), []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filtered = useMemo(() => {
    let result = allLeads;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.customer.toLowerCase().includes(q) ||
          l.shopName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((l) => l.status === statusFilter);
    return result;
  }, [allLeads, search, statusFilter]);

  const totalValue = filtered.reduce((sum, l) => sum + l.configuredValue, 0);

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Lead Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track all incoming leads across the platform.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search leads by name, shop, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500]/40 transition-all"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors w-full sm:w-auto"
          >
            <span className="text-gray-400 dark:text-gray-500 text-xs">Status:</span>
            <span className="font-medium capitalize">{statusFilter === 'all' ? 'All Statuses' : statusFilter}</span>
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-1" />
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute top-full mt-1 right-0 z-20 w-48 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-white/[0.08] shadow-xl py-1">
                {(['all', 'new', 'contacted', 'qualified', 'closed'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                      statusFilter === s ? 'text-[#FF4500] font-medium' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white/[0.1] text-white text-sm font-medium hover:bg-gray-800 dark:hover:bg-white/[0.15] transition-colors"
        >
          {exportSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Exported!
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export CSV
            </>
          )}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-6 mb-5 px-1"
      >
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> leads
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total value: <span className="font-semibold text-gray-900 dark:text-white">${totalValue.toLocaleString()}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Date</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Customer</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Shop</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Contact</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Configured Value</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-gray-400 dark:text-gray-500">
                    No leads found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((lead, i) => {
                  const cfg = STATUS_CONFIG[lead.status];
                  return (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.02 * i }}
                      className="border-b border-gray-50 dark:border-white/[0.03] last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(lead.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.customer}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                            <Car className="w-3 h-3" /> {lead.car}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">{lead.shopName}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-400 dark:text-gray-500" /> {lead.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400 dark:text-gray-500" /> {lead.phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">${lead.configuredValue.toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
