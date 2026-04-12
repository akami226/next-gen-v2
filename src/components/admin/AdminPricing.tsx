import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Paintbrush,
  Circle as CircleIcon,
  AudioLines,
  SunDim,
  ArrowDownUp,
} from 'lucide-react';
import { getConfiguratorItems, type ConfiguratorItem } from '../../data/adminDemo';

type CategoryFilter = 'all' | ConfiguratorItem['category'];

const CATEGORY_CONFIG: Record<ConfiguratorItem['category'], { label: string; icon: React.ElementType; color: string }> = {
  wrap: { label: 'Wraps', icon: Paintbrush, color: '#FF4500' },
  wheels: { label: 'Wheels', icon: CircleIcon, color: '#3B82F6' },
  exhaust: { label: 'Exhausts', icon: AudioLines, color: '#10B981' },
  tint: { label: 'Tint', icon: SunDim, color: '#F59E0B' },
  suspension: { label: 'Suspension', icon: ArrowDownUp, color: '#8B5CF6' },
};

export default function AdminPricing() {
  const [items, setItems] = useState<ConfiguratorItem[]>(() => getConfiguratorItems());
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filtered = useMemo(() => {
    if (category === 'all') return items;
    return items.filter((item) => item.category === category);
  }, [items, category]);

  const updatePrice = (id: string, price: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, price } : item)));
  };

  const toggleStock = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item)));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const categories: CategoryFilter[] = ['all', 'wrap', 'wheels', 'exhaust', 'tint', 'suspension'];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Configurator Pricing</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage pricing and inventory for all configurator items.</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            saveSuccess
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-500/20'
              : 'bg-gray-900 dark:bg-white/[0.1] text-white hover:bg-gray-800 dark:hover:bg-white/[0.15] shadow-lg shadow-gray-200 dark:shadow-black/20'
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Changes Saved
            </>
          ) : (
            'Save Changes'
          )}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 mb-6 overflow-x-auto pb-1"
      >
        {categories.map((cat) => {
          const active = category === cat;
          const cfg = cat !== 'all' ? CATEGORY_CONFIG[cat] : null;
          const Icon = cfg?.icon;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-gray-900 dark:bg-white/[0.12] text-white shadow-md'
                  : 'bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.06]'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" style={{ color: active ? 'white' : cfg.color }} />}
              {cat === 'all' ? 'All Items' : cfg?.label}
              <span className={`text-xs ml-1 ${active ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                ({cat === 'all' ? items.length : items.filter((i) => i.category === cat).length})
              </span>
            </button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Item</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Category</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Price</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3.5">Availability</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const catCfg = CATEGORY_CONFIG[item.category];
                const CatIcon = catCfg.icon;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.02 * i }}
                    className="border-b border-gray-50 dark:border-white/[0.03] last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl border-2 border-gray-100 dark:border-white/[0.1] shrink-0"
                          style={{ backgroundColor: item.thumbnail }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${catCfg.color}10`,
                          color: catCfg.color,
                        }}
                      >
                        <CatIcon className="w-3 h-3" />
                        {catCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updatePrice(item.id, parseInt(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500]/40 transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleStock(item.id)}
                          className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                            item.inStock ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/[0.1]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                              item.inStock ? 'left-[22px]' : 'left-0.5'
                            }`}
                          />
                        </button>
                        <span className={`ml-3 text-xs font-medium self-center ${item.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
