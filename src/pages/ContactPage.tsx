import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Check,
  AlertCircle,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InstagramIcon, FacebookIcon, TiktokIcon, TwitterIcon } from '../components/SocialIcons';
import type { User } from '@supabase/supabase-js';
import type { ShopNotification } from '../types';
import Header from '../components/Header';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';

interface ContactPageProps {
  onBack: () => void;
  user?: User | null;
  isShopOwner?: boolean;
  profilePictureUrl?: string | null;
  onSignOut?: () => void;
  notifications?: ShopNotification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onViewAllNotifications?: () => void;
  onClickNotification?: (notification: ShopNotification) => void;
}

const SUBJECTS = [
  'General Inquiry',
  'Shop Registration Help',
  'Technical Support',
  'Partnership',
  'Other',
];

const FAQ = [
  {
    q: 'Is the 3D configurator free to use?',
    a: 'Yes, the configurator is completely free for all users. You can visualize wraps, wheels, tint, and exhaust without creating an account.',
  },
  {
    q: 'How do I register my shop on NextGen?',
    a: 'Click the "Register Your Shop" button and follow the step-by-step registration process. You will set up your account, shop details, and social links. Approval typically takes 1-2 business days.',
  },
  {
    q: 'How do I send my build to a shop?',
    a: 'After configuring your car in the 3D viewer, click "Get Built" or "Request Quote" to send your exact specifications to a verified shop near you.',
  },
  {
    q: 'What does it cost for shops to be listed?',
    a: 'We offer a free Starter plan for shops to get started. Premium plans with additional features and lead priority are available on our Pricing page.',
  },
  {
    q: 'Can I save and share my builds?',
    a: 'Yes. Create a free account to save builds to your profile. You can also share a screenshot of your build directly from the configurator.',
  },
  {
    q: 'How are shops verified?',
    a: 'Every shop goes through a review process where we confirm business legitimacy, location, and service quality before listing them on the platform.',
  },
];

const INPUT_BASE = 'w-full px-4 py-3.5 min-h-[44px] rounded-xl bg-[#1a1a1a] border text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-200';
const INPUT_NORMAL = `${INPUT_BASE} border-white/[0.08] focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)]`;
const INPUT_ERROR = `${INPUT_BASE} border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_12px_rgba(239,68,68,0.1)]`;

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

export default function ContactPage({ onBack, user, isShopOwner, profilePictureUrl, onSignOut, notifications, onMarkRead, onMarkAllRead, onViewAllNotifications, onClickNotification }: ContactPageProps) {
  useSEO(SEO_CONFIGS.contact);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const clearError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Name is required';
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email';
    }
    if (!subject) errs.subject = 'Please select a subject';
    if (!message.trim()) errs.message = 'Message is required';
    return errs;
  }, [fullName, email, subject, message]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await supabase.from('contact_submissions').insert({
        full_name: fullName.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [fullName, email, subject, message, validate]);

  return (
    <div className="min-h-screen w-screen bg-[#080808] font-sans antialiased overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF4500]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF4500]/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-50">
        <Header
          user={user}
          isShopOwner={isShopOwner}
          profilePictureUrl={profilePictureUrl}
          onSignOut={onSignOut}
          notifications={notifications}
          onMarkRead={onMarkRead}
          onMarkAllRead={onMarkAllRead}
          onViewAllNotifications={onViewAllNotifications}
          onClickNotification={onClickNotification}
        />
      </div>

      <section className="relative px-6 py-16 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
            Get in <span className="text-[#FF4500]">Touch</span>
          </h2>
          <p className="text-base sm:text-lg text-white/40 leading-relaxed max-w-lg mx-auto">
            Have a question, need help, or want to partner with us? We would love to hear from you.
          </p>
        </motion.div>
      </section>

      <section className="relative px-6 pb-16 sm:pb-20">
        <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            {...fade}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                      <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent</h3>
                    <p className="text-sm text-white/40 max-w-sm mx-auto mb-6">
                      Thank you for reaching out. We will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setFullName('');
                        setEmail('');
                        setSubject('');
                        setMessage('');
                      }}
                      className="text-sm text-[#FF4500] font-semibold hover:text-[#FF5722] transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <h3 className="text-lg font-bold text-white mb-1">Send us a Message</h3>

                    <div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); clearError('fullName'); }}
                        placeholder="Full name"
                        className={fieldErrors.fullName ? INPUT_ERROR : INPUT_NORMAL}
                      />
                      {fieldErrors.fullName && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.fullName}</p>}
                    </div>

                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearError('email'); }}
                        placeholder="Email address"
                        className={fieldErrors.email ? INPUT_ERROR : INPUT_NORMAL}
                      />
                      {fieldErrors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.email}</p>}
                    </div>

                    <div className="relative">
                      <select
                        value={subject}
                        onChange={e => { setSubject(e.target.value); clearError('subject'); }}
                        className={`${fieldErrors.subject ? INPUT_ERROR : INPUT_NORMAL} appearance-none pr-10 ${!subject ? 'text-white/20' : ''}`}
                      >
                        <option value="" disabled>Select a subject</option>
                        {SUBJECTS.map(s => (
                          <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                      {fieldErrors.subject && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.subject}</p>}
                    </div>

                    <div>
                      <textarea
                        value={message}
                        onChange={e => { setMessage(e.target.value); clearError('message'); }}
                        placeholder="Your message..."
                        rows={5}
                        className={`${fieldErrors.message ? INPUT_ERROR : INPUT_NORMAL} resize-none`}
                      />
                      {fieldErrors.message && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.message}</p>}
                    </div>

                    <AnimatePresence>
                      {submitError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span className="text-[11px] text-red-400 font-medium">{submitError}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full min-h-[44px] py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20 flex items-center justify-center gap-2 hover:bg-[#FF5722] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            {...fade}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-5">Contact Info</h3>
              <div className="space-y-4">
                <ContactInfoRow icon={Mail} label="Email" value="hello@nextgen3d.com" />
                <ContactInfoRow icon={Phone} label="Phone" value="+1 (555) 123-4567" />
                <ContactInfoRow icon={MapPin} label="Office" value="Austin, TX" />
              </div>
              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <p className="text-[10px] text-white/25 font-medium tracking-wider uppercase mb-3">Follow Us</p>
                <div className="flex items-center gap-3">
                  {[
                    { Icon: InstagramIcon, label: 'Instagram' },
                    { Icon: FacebookIcon, label: 'Facebook' },
                    { Icon: TiktokIcon, label: 'TikTok' },
                    { Icon: TwitterIcon, label: 'X' },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      aria-label={label}
                      className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.1] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#FF4500]/[0.04] border border-[#FF4500]/15 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FF4500]/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#FF4500]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Response Time</p>
                  <p className="text-[11px] text-white/35 mt-0.5">We typically respond within 24 hours</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 py-16 sm:py-20">
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div {...fade} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Frequently Asked Questions</h3>
            <p className="text-sm text-white/30 max-w-md mx-auto">Quick answers to common questions</p>
          </motion.div>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                {...fade}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-colors duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white/80 pr-4">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/25 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-[12px] text-white/35 leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center pb-12">
        <p className="text-[10px] text-white/15 tracking-wider uppercase">
          NextGen 3D Configurator &mdash; Built for enthusiasts
        </p>
      </div>
    </div>
  );
}

function ContactInfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-white/40" />
      </div>
      <div>
        <p className="text-[10px] text-white/25 font-medium tracking-wider uppercase mb-0.5">{label}</p>
        <p className="text-xs text-white/60">{value}</p>
      </div>
    </div>
  );
}
