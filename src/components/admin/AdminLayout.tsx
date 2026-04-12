import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  Shield,
  Search,
  Bell,
  X,
  Sliders,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export type AdminTab = 'overview' | 'leads' | 'pricing' | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
  onBack: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Lead Management', icon: FileText },
  { id: 'pricing', label: 'Configurator Pricing', icon: Sliders },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ activeTab, onTabChange, onSignOut, onBack, children }: AdminLayoutProps) {
  const [mobileNav, setMobileNav] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-screen w-screen bg-[#f8f9fb] dark:bg-[#0a0a0a] flex font-sans antialiased overflow-hidden transition-colors duration-300">
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col bg-white dark:bg-[#111111] border-r border-gray-200/80 dark:border-white/[0.06] transition-colors duration-300">
        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          onSignOut={onSignOut}
          onBack={onBack}
        />
      </aside>

      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileNav(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] z-50 flex flex-col bg-white dark:bg-[#111111] border-r border-gray-200/80 dark:border-white/[0.06] lg:hidden"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setMobileNav(false)}
                  className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent
                activeTab={activeTab}
                onTabChange={(tab) => {
                  onTabChange(tab);
                  setMobileNav(false);
                }}
                onSignOut={onSignOut}
                onBack={onBack}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#111111] border-b border-gray-200/80 dark:border-white/[0.06] transition-colors duration-300">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => setMobileNav(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className={`relative max-w-md w-full transition-all duration-200 ${searchFocused ? 'max-w-lg' : ''}`}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search anything..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500]/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="relative w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF4500] text-[9px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  activeTab,
  onTabChange,
  onSignOut,
  onBack,
}: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center shrink-0 shadow-lg shadow-[#FF4500]/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">NextGen Admin</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">Platform Management</p>
          </div>
        </div>
      </div>

      <div className="px-3 mb-2">
        <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold px-3 mb-2">Main Menu</p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#FF4500]/[0.08] text-[#FF4500] shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[#FF4500]' : 'text-gray-400 dark:text-gray-500'}`} />
                {item.label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF4500]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-3 pb-3 space-y-1">
        <div className="h-px bg-gray-100 dark:bg-white/[0.06] mb-2" />
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
        >
          <ArrowLeft className="w-[18px] h-[18px] shrink-0 text-gray-400 dark:text-gray-500" />
          Back to Site
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 text-gray-400 dark:text-gray-500" />
          Sign Out
        </button>
      </div>
    </>
  );
}
