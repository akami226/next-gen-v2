import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Star,
  Store,
  CreditCard,
  LogOut,
  Menu,
  Car,
  Camera,
  Share2,
  Settings,
  BarChart3,
  Palette,
  Eye,
  Bell,
} from 'lucide-react';

export type DashboardTab = 'overview' | 'leads' | 'reviews' | 'profile' | 'photos' | 'socials' | 'branding' | 'settings' | 'statistics' | 'subscription' | 'notifications';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  shopName: string;
  logoUrl?: string | null;
  onSignOut: () => void;
  onBack: () => void;
  onPreviewShop?: () => void;
  unreadNotifications?: number;
  children: React.ReactNode;
}

interface NavSection {
  title: string;
  items: { id: DashboardTab; label: string; icon: React.ElementType }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Dashboard',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'statistics', label: 'Statistics', icon: BarChart3 },
      { id: 'leads', label: 'Leads', icon: FileText },
      { id: 'reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    title: 'Shop Management',
    items: [
      { id: 'profile', label: 'Shop Profile', icon: Store },
      { id: 'branding', label: 'Logo & Branding', icon: Palette },
      { id: 'photos', label: 'Photos', icon: Camera },
      { id: 'socials', label: 'Social Media', icon: Share2 },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
    ],
  },
];

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

export default function DashboardLayout({
  activeTab,
  onTabChange,
  shopName,
  logoUrl,
  onSignOut,
  onBack,
  onPreviewShop,
  unreadNotifications,
  children,
}: DashboardLayoutProps) {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#080808] light:bg-[#f0f0f2] flex font-sans antialiased overflow-hidden">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.06] light:border-gray-200 bg-[#0a0a0a] light:bg-white">
        <SidebarContent
          shopName={shopName}
          logoUrl={logoUrl}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onSignOut={onSignOut}
          onBack={onBack}
          onPreviewShop={onPreviewShop}
          unreadNotifications={unreadNotifications}
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
                shopName={shopName}
                logoUrl={logoUrl}
                activeTab={activeTab}
                onTabChange={(tab) => {
                  onTabChange(tab);
                  setMobileNav(false);
                }}
                onSignOut={onSignOut}
                onBack={onBack}
                onPreviewShop={() => {
                  setMobileNav(false);
                  onPreviewShop?.();
                }}
                unreadNotifications={unreadNotifications}
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
            {ALL_ITEMS.find((n) => n.id === activeTab)?.label}
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
  shopName,
  logoUrl,
  activeTab,
  onTabChange,
  onSignOut,
  onBack,
  onPreviewShop,
  unreadNotifications,
}: {
  shopName: string;
  logoUrl?: string | null;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onSignOut: () => void;
  onBack: () => void;
  onPreviewShop?: () => void;
  unreadNotifications?: number;
}) {
  return (
    <>
      <div className="p-5 border-b border-white/[0.06] light:border-gray-200">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/[0.1] light:border-gray-200 shrink-0">
              <img src={logoUrl} alt={shopName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#0e0e0e] light:bg-gray-100 border-2 border-white/[0.1] light:border-gray-200 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-[#FF4500] tracking-tighter">
                {shopName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-white light:text-gray-900 truncate">{shopName}</p>
            <p className="text-[10px] text-white/30 light:text-gray-400 uppercase tracking-wider">Shop Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[9px] text-white/20 light:text-gray-400 uppercase tracking-widest font-semibold px-3 mb-1.5">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                const showBadge = item.id === 'notifications' && unreadNotifications && unreadNotifications > 0;
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
                    {showBadge && (
                      <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF4500] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/[0.06] light:border-gray-200 space-y-0.5">
        <button
          onClick={onPreviewShop}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#FF4500]/60 hover:text-[#FF4500] hover:bg-[#FF4500]/[0.06] transition-colors"
        >
          <Eye className="w-4 h-4 shrink-0" />
          Preview My Shop
        </button>
        <button
          onClick={onBack}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 light:text-gray-500 hover:text-white/70 light:hover:text-gray-700 hover:bg-white/[0.04] light:hover:bg-gray-100 transition-colors"
        >
          <Car className="w-4 h-4 shrink-0" />
          Configurator
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
