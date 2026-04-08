import { useState } from 'react';
import AdminLayout, { type AdminTab } from '../components/admin/AdminLayout';
import AdminOverview from '../components/admin/AdminOverview';
import AdminShops from '../components/admin/AdminShops';
import AdminUsers from '../components/admin/AdminUsers';
import AdminLeads from '../components/admin/AdminLeads';
import AdminSubscriptions from '../components/admin/AdminSubscriptions';

interface AdminDashboardPageProps {
  onSignOut: () => void;
  onBack: () => void;
}

export default function AdminDashboardPage({ onSignOut, onBack }: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onSignOut={onSignOut}
      onBack={onBack}
    >
      {activeTab === 'overview' && <AdminOverview />}
      {activeTab === 'shops' && <AdminShops />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'leads' && <AdminLeads />}
      {activeTab === 'subscriptions' && <AdminSubscriptions />}
    </AdminLayout>
  );
}
