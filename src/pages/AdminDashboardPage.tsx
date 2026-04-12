import { useState } from 'react';
import AdminLayout, { type AdminTab } from '../components/admin/AdminLayout';
import AdminOverview from '../components/admin/AdminOverview';
import AdminLeads from '../components/admin/AdminLeads';
import AdminPricing from '../components/admin/AdminPricing';
import AdminSettings from '../components/admin/AdminSettings';

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
      {activeTab === 'leads' && <AdminLeads />}
      {activeTab === 'pricing' && <AdminPricing />}
      {activeTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
}
