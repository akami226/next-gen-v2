import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Phone,
  Mail,
  Globe,
  MapPin,
  Camera,
  Plus,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { Shop } from '../../types';

export default function DashboardProfile({ shop }: { shop: Shop }) {
  const [name, setName] = useState(shop.name);
  const [bio, setBio] = useState(shop.bio);
  const [phone, setPhone] = useState(shop.phone);
  const [email, setEmail] = useState(shop.email);
  const [address, setAddress] = useState(shop.address);
  const [city, setCity] = useState(shop.city);
  const [state, setState] = useState(shop.state);
  const [zip, setZip] = useState(shop.zip);
  const [specialties, setSpecialties] = useState(shop.specialties);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [hours, setHours] = useState(shop.hours);
  const [socials, setSocials] = useState(shop.socials || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (s: string) => {
    setSpecialties(specialties.filter((sp) => sp !== s));
  };

  const updateHour = (index: number, field: string, value: string | boolean) => {
    setHours(hours.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Profile</h2>
          <p className="text-sm text-white/40 mt-1">Manage your shop's public profile.</p>
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

      <div className="space-y-6">
        <Section title="Basic Info" delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Shop Name" value={name} onChange={setName} />
            <Field label="Phone" value={phone} onChange={setPhone} icon={Phone} />
            <Field label="Email" value={email} onChange={setEmail} icon={Mail} />
            <Field label="Website" value={socials.website || ''} onChange={(v) => setSocials({ ...socials, website: v })} icon={Globe} />
          </div>
          <div className="mt-3">
            <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none resize-none focus:border-[#FF4500]/40 transition-colors"
            />
          </div>
        </Section>

        <Section title="Location" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Field label="Street Address" value={address} onChange={setAddress} icon={MapPin} />
            </div>
            <Field label="City" value={city} onChange={setCity} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="State" value={state} onChange={setState} />
              <Field label="ZIP" value={zip} onChange={setZip} />
            </div>
          </div>
        </Section>

        <Section title="Services" delay={0.15}>
          <div className="flex flex-wrap gap-2 mb-3">
            {specialties.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF4500]/[0.08] border border-[#FF4500]/20 text-xs text-[#FF4500] font-semibold group"
              >
                {s}
                <button
                  onClick={() => removeSpecialty(s)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
              placeholder="Add service..."
              className="flex-1 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF4500]/40 transition-colors"
            />
            <button
              onClick={addSpecialty}
              className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </Section>

        <Section title="Gallery" delay={0.2}>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {shop.gallery.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/[0.08]">
                <img src={url} alt={`Gallery photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
            <button className="aspect-square rounded-xl border-2 border-dashed border-white/[0.1] flex flex-col items-center justify-center gap-1 hover:border-white/[0.2] transition-colors group">
              <Camera className="w-5 h-5 text-white/15 group-hover:text-white/30 transition-colors" />
              <span className="text-[9px] text-white/15 group-hover:text-white/30 transition-colors">Add Photo</span>
            </button>
          </div>
        </Section>

        <Section title="Social Media" delay={0.25}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Instagram" value={socials.instagram || ''} onChange={(v) => setSocials({ ...socials, instagram: v })} placeholder="@username" />
            <Field label="Facebook" value={socials.facebook || ''} onChange={(v) => setSocials({ ...socials, facebook: v })} placeholder="Page URL" />
            <Field label="TikTok" value={socials.tiktok || ''} onChange={(v) => setSocials({ ...socials, tiktok: v })} placeholder="@username" />
            <Field label="Twitter / X" value={socials.twitter || ''} onChange={(v) => setSocials({ ...socials, twitter: v })} placeholder="@handle" />
            <Field label="WhatsApp" value={socials.whatsapp || ''} onChange={(v) => setSocials({ ...socials, whatsapp: v })} placeholder="Phone number" />
          </div>
        </Section>

        <Section title="Business Hours" delay={0.3}>
          <div className="space-y-2">
            {hours.map((h, i) => (
              <div key={h.day} className="flex items-center gap-3 py-1">
                <span className="text-xs text-white/40 w-20 shrink-0">{h.day}</span>
                <label className="flex items-center gap-2 shrink-0">
                  <input
                    type="checkbox"
                    checked={!h.closed}
                    onChange={(e) => updateHour(i, 'closed', !e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.06] accent-[#FF4500]"
                  />
                  <span className="text-[10px] text-white/25">{h.closed ? 'Closed' : 'Open'}</span>
                </label>
                {!h.closed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={h.open}
                      onChange={(e) => updateHour(i, 'open', e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-xs text-white text-center outline-none focus:border-[#FF4500]/40 transition-colors"
                    />
                    <span className="text-[10px] text-white/20">to</span>
                    <input
                      type="text"
                      value={h.close}
                      onChange={(e) => updateHour(i, 'close', e.target.value)}
                      className="w-20 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-white/[0.08] text-xs text-white text-center outline-none focus:border-[#FF4500]/40 transition-colors"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5"
    >
      <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ElementType;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/15" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full py-2.5 rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FF4500]/40 transition-colors ${
            Icon ? 'pl-9 pr-4' : 'px-4'
          }`}
        />
      </div>
    </div>
  );
}
