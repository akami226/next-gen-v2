import { useState, useEffect } from 'react';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';
import type { Shop, ShopNotification } from '../types';
import type { User } from '@supabase/supabase-js';
import type { ShopOwnerData } from '../hooks/useAuth';
import DashboardLayout, { type DashboardTab } from '../components/dashboard/DashboardLayout';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardLeads from '../components/dashboard/DashboardLeads';
import DashboardReviews from '../components/dashboard/DashboardReviews';
import DashboardProfile from '../components/dashboard/DashboardProfile';
import DashboardSubscription from '../components/dashboard/DashboardSubscription';
import DashboardPhotos from '../components/dashboard/DashboardPhotos';
import DashboardSocials from '../components/dashboard/DashboardSocials';
import DashboardSettings from '../components/dashboard/DashboardSettings';
import DashboardStatistics from '../components/dashboard/DashboardStatistics';
import DashboardBranding from '../components/dashboard/DashboardBranding';
import DashboardNotifications from '../components/dashboard/DashboardNotifications';

interface DashboardPageProps {
  shop: Shop;
  shopOwnerData: ShopOwnerData | null;
  user: User;
  initialTab?: string;
  onSignOut: () => void;
  onBack: () => void;
  onBrandingUpdate: () => void;
  onPreviewShop: () => void;
  notifications: ShopNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  onViewAllNotifications: () => void;
  onClickNotification: (notification: ShopNotification) => void;
}

export default function DashboardPage({ shop, shopOwnerData, user, initialTab, onSignOut, onBack, onBrandingUpdate, onPreviewShop, notifications, onMarkRead, onMarkAllRead, onDeleteNotification, onViewAllNotifications, onClickNotification }: DashboardPageProps) {
  useSEO(SEO_CONFIGS.dashboard);
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    const validTabs: DashboardTab[] = ['overview', 'leads', 'reviews', 'profile', 'photos', 'socials', 'branding', 'settings', 'statistics', 'subscription', 'notifications'];
    if (initialTab && validTabs.includes(initialTab as DashboardTab)) {
      return initialTab as DashboardTab;
    }
    return 'overview';
  });

  useEffect(() => {
    if (initialTab) {
      const validTabs: DashboardTab[] = ['overview', 'leads', 'reviews', 'profile', 'photos', 'socials', 'branding', 'settings', 'statistics', 'subscription', 'notifications'];
      if (validTabs.includes(initialTab as DashboardTab)) {
        setActiveTab(initialTab as DashboardTab);
      }
    }
  }, [initialTab]);

  const shopName = shopOwnerData?.shop_name || shop.name;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      shopName={shopName}
      logoUrl={shopOwnerData?.logo_url}
      onSignOut={onSignOut}
      onBack={onBack}
      onPreviewShop={onPreviewShop}
      unreadNotifications={notifications.filter((n) => !n.is_read).length}
    >
      {activeTab === 'overview' && <DashboardOverview shop={shop} onPreviewShop={onPreviewShop} />}
      {activeTab === 'notifications' && (
        <DashboardNotifications
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onDelete={onDeleteNotification}
          onClickNotification={(notif) => {
            onClickNotification(notif);
          }}
        />
      )}
      {activeTab === 'leads' && <DashboardLeads />}
      {activeTab === 'reviews' && <DashboardReviews shop={shop} />}
      {activeTab === 'profile' && <DashboardProfile shop={shop} />}
      {activeTab === 'photos' && <DashboardPhotos shop={shop} />}
      {activeTab === 'socials' && <DashboardSocials shop={shop} />}
      {activeTab === 'branding' && <DashboardBranding shop={shop} shopOwnerData={shopOwnerData} user={user} onBrandingUpdate={onBrandingUpdate} />}
      {activeTab === 'settings' && <DashboardSettings user={user} />}
      {activeTab === 'statistics' && <DashboardStatistics shop={shop} />}
      {activeTab === 'subscription' && <DashboardSubscription />}
    </DashboardLayout>
  );
}
