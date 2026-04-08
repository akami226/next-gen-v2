import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Car, Palette, Disc3, PanelTop, AudioLines } from 'lucide-react';
import type { Shop, BuildConfig } from '../types';
import { supabase } from '../lib/supabase';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  buildConfig: BuildConfig;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  cityState: string;
  contactTime: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  cityState?: string;
}

const CONTACT_TIMES = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

const BUILD_ITEMS = [
  { key: 'car' as const, label: 'Vehicle', icon: Car },
  { key: 'wrap' as const, label: 'Wrap', icon: Palette },
  { key: 'wheels' as const, label: 'Wheels', icon: Disc3 },
  { key: 'tint' as const, label: 'Tint', icon: PanelTop },
  { key: 'exhaust' as const, label: 'Exhaust', icon: AudioLines },
];

function BuildSummaryCard({ config }: { config: BuildConfig }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
      <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">
        Your Current Build
      </p>
      <div className="space-y-2.5">
        {BUILD_ITEMS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center gap-3">
            <Icon className="w-3.5 h-3.5 text-[#FF4500]/60 shrink-0" />
            <span className="text-[10px] text-white/30 w-14 shrink-0">{label}</span>
            <span className="text-[11px] text-white/70 font-medium truncate">{config[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ shopName, config, onClose }: { shopName: string; config: BuildConfig; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
      >
        <CheckCircle className="w-16 h-16 text-emerald-500 mb-5" strokeWidth={1.5} />
      </motion.div>

      <h3 className="text-xl font-bold text-white mb-2">Quote Request Sent!</h3>
      <p className="text-sm text-[#FF4500] mb-6">
        {shopName} will contact you within 24 hours
      </p>

      <div className="w-full mb-6">
        <BuildSummaryCard config={config} />
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm font-semibold hover:bg-white/[0.1] active:scale-[0.98] transition-all duration-200"
      >
        Configure Another Build
      </button>
    </motion.div>
  );
}

const INPUT_BASE = 'w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-200';
const INPUT_NORMAL = `${INPUT_BASE} border-white/[0.08] focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)]`;
const INPUT_ERROR = `${INPUT_BASE} border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_12px_rgba(239,68,68,0.1)]`;

export default function QuoteModal({ isOpen, onClose, shop, buildConfig }: QuoteModalProps) {
  const [form, setForm] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    cityState: '',
    contactTime: 'Anytime',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setForm({ fullName: '', email: '', phone: '', cityState: '', contactTime: 'Anytime', notes: '' });
    setErrors({});
    setSubmitted(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(resetForm, 300);
  }, [onClose, resetForm]);

  const validate = useCallback((): FormErrors => {
    const e: FormErrors = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.cityState.trim()) e.cityState = 'City and state is required';
    return e;
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (!shop) return;

    setSubmitting(true);

    const leadData = {
      shop_name: shop.name,
      shop_location: `${shop.city}, ${shop.state}`,
      customer_name: form.fullName.trim(),
      customer_email: form.email.trim(),
      customer_phone: form.phone.trim(),
      customer_city: form.cityState.trim(),
      contact_time: form.contactTime,
      notes: form.notes.trim(),
      car_config: buildConfig,
      status: 'pending',
    };

    await supabase.from('quote_leads').insert(leadData);

    const localLead = {
      id: Date.now(),
      shopName: shop.name,
      shopLocation: `${shop.city}, ${shop.state}`,
      customerName: form.fullName.trim(),
      customerEmail: form.email.trim(),
      customerPhone: form.phone.trim(),
      customerCity: form.cityState.trim(),
      contactTime: form.contactTime,
      notes: form.notes.trim(),
      carConfig: buildConfig,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    const existing = JSON.parse(localStorage.getItem('quoteLeads') || '[]');
    existing.push(localLead);
    localStorage.setItem('quoteLeads', JSON.stringify(existing));

    setSubmitting(false);
    setSubmitted(true);
  }, [form, validate, shop, buildConfig]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  }, [errors]);

  const shopName = shop?.name ?? '';
  const shopLocation = shop ? `${shop.city}, ${shop.state}` : '';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
          className="overflow-y-auto"
          onClick={handleClose}
        >
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            className="pointer-events-none"
          />

          <div className="relative flex items-start justify-center min-h-full py-8 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[600px] bg-[#0e0e0e] light:bg-white border border-white/[0.08] light:border-gray-200 rounded-2xl shadow-2xl shadow-black/50 light:shadow-xl light:shadow-black/10"
            >
            <div className="p-6">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    {shop?.logoUrl ? (
                      <img src={shop.logoUrl} alt={shopName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0e0e0e] border border-white/[0.1] rounded-lg flex items-center justify-center">
                        <span className="text-[9px] font-black text-[#FF4500] tracking-tighter">
                          {shopName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{shopName}</h2>
                    <p className="text-xs text-[#FF4500]/70 mt-0.5">{shopLocation}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-white/[0.06] my-5" />

              {submitted ? (
                <SuccessScreen shopName={shopName} config={buildConfig} onClose={handleClose} />
              ) : (
                <>
                  <div className="mb-5">
                    <BuildSummaryCard config={buildConfig} />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                        className={errors.fullName ? INPUT_ERROR : INPUT_NORMAL}
                        placeholder="John Doe"
                      />
                      {errors.fullName && <p className="text-[10px] text-red-400 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={errors.email ? INPUT_ERROR : INPUT_NORMAL}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={errors.phone ? INPUT_ERROR : INPUT_NORMAL}
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                        City and State <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.cityState}
                        onChange={(e) => updateField('cityState', e.target.value)}
                        className={errors.cityState ? INPUT_ERROR : INPUT_NORMAL}
                        placeholder="Los Angeles, CA"
                      />
                      {errors.cityState && <p className="text-[10px] text-red-400 mt-1">{errors.cityState}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                        Best Time to Contact
                      </label>
                      <select
                        value={form.contactTime}
                        onChange={(e) => updateField('contactTime', e.target.value)}
                        className={`${INPUT_NORMAL} appearance-none cursor-pointer`}
                      >
                        {CONTACT_TIMES.map((t) => (
                          <option key={t} value={t} className="bg-[#1a1a1a] text-white">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                        Additional Notes
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => updateField('notes', e.target.value)}
                        rows={3}
                        className={`${INPUT_NORMAL} resize-none`}
                        placeholder="Tell us anything else about your build..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending...' : 'Send Quote Request'}
                    </button>

                    <p className="text-[10px] text-white/20 text-center">
                      Your information is never shared with third parties
                    </p>
                  </form>
                </>
              )}
            </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
