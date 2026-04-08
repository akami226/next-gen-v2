import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Store,
  Users,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';

export type AdminTab = 'overview' | 'shops' | 'users' | 'leads' | 'subscriptions';

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
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'shops', label: 'Shops', icon: Store },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'leads', label: 'Leads & Analytics', icon: FileText },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
];

export default function AdminLayout({ activeTab, onTabChange, onSignOut, onBack, children }: AdminLayoutProps) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#080808] light:bg-[#f0f0f2] flex font-sans antialiased overflow-hidden">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] light:border-gray-200 bg-[#0a0a0a] light:bg-white">
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
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileNav(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col border-r border-white/[0.06] light:border-gray-200 bg-[#0a0a0a] light:bg-white lg:hidden"
            >
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
        <header className="h-14 shrink-0 flex items-center px-4 sm:px-6 border-b border-white/[0.06] light:border-gray-200 bg-[#0a0a0a] light:bg-white">
          <button
            onClick={() => setMobileNav(true)}
            className="lg:hidden w-8 h-8 rounded-lg bg-white/[0.05] light:bg-gray-100 border border-white/[0.08] light:border-gray-200 flex items-center justify-center text-white/40 light:text-gray-500 hover:text-white/70 light:hover:text-gray-700 transition-colors mr-3"
          >
            <Menu className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-bold text-white light:text-gray-900 truncate">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
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
      <div className="p-5 border-b border-white/[0.06] light:border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#FF4500]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white light:text-gray-900 truncate">Admin Panel</p>
            <p className="text-[10px] text-white/30 light:text-gray-400 uppercase tracking-wider">NextGen Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <p className="text-[9px] text-white/20 light:text-gray-400 uppercase tracking-widest font-semibold px-3 mb-1.5">Management</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/15'
                    : 'text-white/40 light:text-gray-500 hover:text-white/70 light:hover:text-gray-700 hover:bg-white/[0.04] light:hover:bg-gray-100 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-white/[0.06] light:border-gray-200 space-y-0.5">
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 light:text-gray-500 hover:text-white/70 light:hover:text-gray-700 hover:bg-white/[0.04] light:hover:bg-gray-100 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Main Site
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 light:text-gray-500 hover:text-red-400/70 hover:bg-red-500/[0.04] transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );
}
