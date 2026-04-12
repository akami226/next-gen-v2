import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Bell,
  Shield,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'NextGen Auto',
    siteUrl: 'https://nextgenauto.com',
    contactEmail: 'admin@nextgenauto.com',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    leadAlerts: true,
    twoFactor: false,
    sessionTimeout: '30',
    maintenanceMode: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your platform configuration and preferences.</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={handleSave}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
            saved
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-500/20'
              : 'bg-gray-900 dark:bg-white/[0.1] text-white hover:bg-gray-800 dark:hover:bg-white/[0.15] shadow-lg shadow-gray-200 dark:shadow-black/20'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </motion.button>
      </div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">General</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Basic platform settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings((p) => ({ ...p, siteName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500]/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Site URL</label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => setSettings((p) => ({ ...p, siteUrl: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500]/40 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings((p) => ({ ...p, contactEmail: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500]/40 transition-all"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Configure how you receive alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              label="Email Notifications"
              description="Receive platform updates via email"
              enabled={settings.emailNotifications}
              onToggle={() => toggle('emailNotifications')}
            />
            <ToggleRow
              label="Push Notifications"
              description="Browser push notifications for real-time alerts"
              enabled={settings.pushNotifications}
              onToggle={() => toggle('pushNotifications')}
            />
            <ToggleRow
              label="Weekly Report"
              description="Get a summary of platform activity every Monday"
              enabled={settings.weeklyReport}
              onToggle={() => toggle('weeklyReport')}
            />
            <ToggleRow
              label="Lead Alerts"
              description="Instant notification when new leads arrive"
              enabled={settings.leadAlerts}
              onToggle={() => toggle('leadAlerts')}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Security</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Access and authentication settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <ToggleRow
              label="Two-Factor Authentication"
              description="Require 2FA for admin sign-in"
              enabled={settings.twoFactor}
              onToggle={() => toggle('twoFactor')}
            />
            <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-white/[0.06] first:border-t-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Session Timeout</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Automatically sign out after inactivity</p>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings((p) => ({ ...p, sessionTimeout: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500]/40"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <ToggleRow
              label="Maintenance Mode"
              description="Temporarily disable public access to the platform"
              enabled={settings.maintenanceMode}
              onToggle={() => toggle('maintenanceMode')}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Danger Zone</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Irreversible actions</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Reset All Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This will permanently delete all platform data. This action cannot be undone.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white dark:bg-white/[0.06] border border-red-200 dark:border-red-500/20 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0 ml-4">
              Reset
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-white/[0.06] first:border-t-0">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-all duration-300 shrink-0 ml-4 ${
          enabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/[0.1]'
        }`}
      >
        <div
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
            enabled ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
