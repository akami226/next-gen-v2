import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle, Loader2, ExternalLink, Globe } from 'lucide-react';
import { InstagramIcon, FacebookIcon, TiktokIcon, TwitterIcon, WhatsappIcon } from '../SocialIcons';
import type { Shop } from '../../types';

interface SocialLink {
  key: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  prefix: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  { key: 'instagram', label: 'Instagram', icon: <InstagramIcon className="w-5 h-5" />, placeholder: 'https://instagram.com/yourshop', prefix: 'instagram.com/' },
  { key: 'facebook', label: 'Facebook', icon: <FacebookIcon className="w-5 h-5" />, placeholder: 'https://facebook.com/yourshop', prefix: 'facebook.com/' },
  { key: 'tiktok', label: 'TikTok', icon: <TiktokIcon className="w-5 h-5" />, placeholder: 'https://tiktok.com/@yourshop', prefix: 'tiktok.com/' },
  { key: 'twitter', label: 'X / Twitter', icon: <TwitterIcon className="w-5 h-5" />, placeholder: 'https://x.com/yourshop', prefix: 'x.com/' },
  { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsappIcon className="w-5 h-5" />, placeholder: '+1 555 123 4567', prefix: '' },
  { key: 'website', label: 'Website', icon: <Globe className="w-5 h-5" />, placeholder: 'https://yourshop.com', prefix: '' },
];

export default function DashboardSocials({ shop }: { shop: Shop }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const s = shop.socials || {};
    return {
      instagram: s.instagram || '',
      facebook: s.facebook || '',
      tiktok: s.tiktok || '',
      twitter: s.twitter || '',
      whatsapp: s.whatsapp || '',
      website: s.website || '',
    };
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const filledCount = Object.values(values).filter((v) => v.trim()).length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Social Media</h2>
          <p className="text-sm text-white/40 mt-1">
            {filledCount} of {SOCIAL_LINKS.length} platforms connected
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF4500] hover:bg-[#FF5722] disabled:opacity-60 text-white text-xs font-bold transition-colors shadow-lg shadow-[#FF4500]/20"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </motion.div>

      <div className="space-y-3">
        {SOCIAL_LINKS.map((link, i) => (
          <motion.div
            key={link.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                values[link.key]?.trim()
                  ? 'bg-[#FF4500]/10 border border-[#FF4500]/20 text-[#FF4500]'
                  : 'bg-white/[0.04] border border-white/[0.06] text-white/20'
              }`}>
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">
                  {link.label}
                </label>
                <input
                  type="text"
                  value={values[link.key] || ''}
                  onChange={(e) => setValues({ ...values, [link.key]: e.target.value })}
                  placeholder={link.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF4500]/40 transition-colors"
                />
              </div>
              {values[link.key]?.trim() && (
                <a
                  href={values[link.key].startsWith('http') ? values[link.key] : `https://${values[link.key]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/25 hover:text-white/50 hover:bg-white/[0.08] transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
      >
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Preview</h3>
        <div className="flex flex-wrap gap-3">
          {SOCIAL_LINKS.filter((l) => values[l.key]?.trim()).map((link) => (
            <div
              key={link.key}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
              <span className="text-white/30">{link.icon}</span>
              <span className="text-xs text-white/50 truncate max-w-[180px]">
                {link.prefix
                  ? values[link.key].replace(/^https?:\/\/(www\.)?/, '').replace(link.prefix, '')
                  : values[link.key]}
              </span>
            </div>
          ))}
          {filledCount === 0 && (
            <p className="text-xs text-white/20">No social links added yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
