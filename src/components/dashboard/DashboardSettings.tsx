import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function DashboardSettings({ user }: { user: SupabaseUser }) {
  const meta = user.user_metadata || {};
  const [displayName, setDisplayName] = useState(meta.display_name || '');
  const [email] = useState(user.email || '');
  const [phone, setPhone] = useState(meta.phone || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [notifications, setNotifications] = useState({
    newLeads: true,
    newReviews: true,
    weeklyReport: false,
    marketing: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savedPassword, setSavedPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSavingProfile(false);
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 2500);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSavingPassword(false);
    setSavedPassword(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedPassword(false), 2500);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl font-bold text-white">Account Settings</h2>
        <p className="text-sm text-white/40 mt-1">Manage your personal account and preferences</p>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Personal Information</h3>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF4500] hover:bg-[#FF5722] disabled:opacity-60 text-white text-xs font-bold transition-colors shadow-lg shadow-[#FF4500]/20"
            >
              {savingProfile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : savedProfile ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {savingProfile ? 'Saving...' : savedProfile ? 'Saved!' : 'Save'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SettingsField label="Display Name" value={displayName} onChange={setDisplayName} icon={User} />
            <SettingsField label="Email" value={email} disabled icon={Mail} />
            <SettingsField label="Phone" value={phone} onChange={setPhone} placeholder="(555) 123-4567" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Change Password</h3>
          <div className="space-y-3 max-w-md">
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF4500]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF4500]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF4500]/40 transition-colors"
                />
              </div>
            </div>
            {passwordError && (
              <p className="text-[11px] text-red-400 font-medium">{passwordError}</p>
            )}
            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-xs font-bold hover:bg-white/[0.1] transition-colors disabled:opacity-50"
            >
              {savingPassword ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : savedPassword ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              {savingPassword ? 'Updating...' : savedPassword ? 'Password Updated!' : 'Update Password'}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-white/30" />
            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Notifications</h3>
          </div>
          <div className="space-y-3">
            <NotificationToggle
              label="New Lead Alerts"
              description="Get notified when a new lead comes in"
              checked={notifications.newLeads}
              onChange={(v) => setNotifications({ ...notifications, newLeads: v })}
            />
            <NotificationToggle
              label="New Review Alerts"
              description="Get notified when someone leaves a review"
              checked={notifications.newReviews}
              onChange={(v) => setNotifications({ ...notifications, newReviews: v })}
            />
            <NotificationToggle
              label="Weekly Performance Report"
              description="Receive a weekly summary of views, leads, and reviews"
              checked={notifications.weeklyReport}
              onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })}
            />
            <NotificationToggle
              label="Marketing & Updates"
              description="Tips, product updates, and promotional offers"
              checked={notifications.marketing}
              onChange={(v) => setNotifications({ ...notifications, marketing: v })}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-500/[0.04] border border-red-500/[0.12] rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400/60" />
            <h3 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider">Danger Zone</h3>
          </div>
          <p className="text-xs text-white/30 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-red-400 font-medium">Are you sure?</p>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-white/50 hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/30 transition-colors">
                Delete My Account
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              Delete Account
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  icon?: React.ElementType;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />}
        <input
          type="text"
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={disabled}
          placeholder={placeholder}
          className={`w-full py-2.5 rounded-xl border text-sm outline-none transition-colors ${
            Icon ? 'pl-9 pr-4' : 'px-4'
          } ${
            disabled
              ? 'bg-white/[0.02] border-white/[0.05] text-white/30 cursor-not-allowed'
              : 'bg-[#1a1a1a] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#FF4500]/40'
          }`}
        />
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 py-2 cursor-pointer group">
      <div>
        <p className="text-sm text-white/60 font-medium group-hover:text-white/80 transition-colors">{label}</p>
        <p className="text-[11px] text-white/25 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full shrink-0 relative transition-colors duration-200 ${
          checked ? 'bg-[#FF4500]' : 'bg-white/[0.1]'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'left-5' : 'left-1'
          }`}
        />
      </button>
    </label>
  );
}
