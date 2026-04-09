import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, ArrowLeft, Check } from 'lucide-react';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';
import RegisterStepAccount from '../components/register/RegisterStepAccount';
import RegisterStepShop from '../components/register/RegisterStepShop';
import RegisterStepSocial from '../components/register/RegisterStepSocial';
import RegisterStepConfirm from '../components/register/RegisterStepConfirm';
import RegisterSuccess from '../components/RegisterSuccess';
import { supabase } from '../lib/supabase';
import type { RegistrationData } from '../types';

const STEPS = [
  { label: 'Account', shortLabel: 'Account' },
  { label: 'Shop Details', shortLabel: 'Shop' },
  { label: 'Social Media', shortLabel: 'Social' },
  { label: 'Confirmation', shortLabel: 'Confirm' },
];

const INITIAL_DATA: RegistrationData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  shopName: '',
  shopAddress: '',
  shopCity: '',
  shopState: '',
  shopZip: '',
  shopPhone: '',
  shopEmail: '',
  shopWebsite: '',
  shopDescription: '',
  services: [],
  instagram: '',
  facebook: '',
  tiktok: '',
  twitter: '',
  whatsapp: '',
};

interface RegisterPageProps {
  onComplete?: () => void;
}

export default function RegisterPage({ onComplete }: RegisterPageProps) {
  useSEO(SEO_CONFIGS.register);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RegistrationData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submitLock = useRef(false);

  const updateField = useCallback((field: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 3));
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { display_name: form.fullName } },
      });
      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('user_profiles').insert({
          id: authData.user.id,
          display_name: form.fullName,
          email: form.email,
        });

        await supabase.from('shop_registrations').insert({
          shop_name: form.shopName,
          owner_name: form.fullName,
          email: form.shopEmail || form.email,
          phone: form.shopPhone,
          website: form.shopWebsite || null,
          years_in_business: 0,
          street_address: form.shopAddress,
          city: form.shopCity,
          state: form.shopState,
          zip: form.shopZip,
          services: form.services,
          bio: form.shopDescription,
          instagram: form.instagram || null,
          facebook: form.facebook || null,
          tiktok: form.tiktok || null,
          twitter: form.twitter || null,
          whatsapp: form.whatsapp || null,
        });

        await supabase.from('shop_owners').insert({
          user_id: authData.user.id,
          shop_id: form.shopName.toLowerCase().replace(/\s+/g, '-'),
          shop_name: form.shopName,
          plan: 'Starter',
          plan_price: 0,
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }

      await supabase.auth.signOut();
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }, [form]);

  if (submitted) {
    return (
      <PageShell>
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 sm:py-16">
          <RegisterSuccess data={form} onComplete={onComplete} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Register Your Shop
          </h2>
          <p className="text-sm text-white/35 max-w-md mx-auto">
            Create your account and set up your shop profile in minutes.
          </p>
        </motion.div>

        <StepIndicator currentStep={step} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 sm:p-8 mt-8"
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepWrapper key="step-0">
                <RegisterStepAccount
                  form={form}
                  errors={errors}
                  setErrors={setErrors}
                  updateField={updateField}
                  onNext={handleNext}
                />
              </StepWrapper>
            )}
            {step === 1 && (
              <StepWrapper key="step-1">
                <RegisterStepShop
                  form={form}
                  errors={errors}
                  setErrors={setErrors}
                  updateField={updateField}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              </StepWrapper>
            )}
            {step === 2 && (
              <StepWrapper key="step-2">
                <RegisterStepSocial
                  form={form}
                  updateField={updateField}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              </StepWrapper>
            )}
            {step === 3 && (
              <StepWrapper key="step-3">
                <RegisterStepConfirm
                  form={form}
                  submitting={submitting}
                  submitError={submitError}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                />
              </StepWrapper>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-screen bg-[#080808] light:bg-[#f0f0f2] font-sans antialiased overflow-y-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none light:hidden">
        <div className="absolute top-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF4500]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF4500]/[0.02] blur-[100px]" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <motion.a
          href="#/"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FF4500]/15 flex items-center justify-center">
            <Car className="w-5 h-5 text-[#FF4500]" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">NextGen</h1>
            <p className="text-[10px] text-white/30 tracking-widest uppercase">3D Configurator</p>
          </div>
        </motion.a>
        <motion.a
          href="#/"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </motion.a>
      </header>

      {children}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex items-center justify-between max-w-md mx-auto"
    >
      {STEPS.map((s, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#FF4500] border-[#FF4500]'
                    : isActive
                    ? 'bg-[#FF4500]/15 border-[#FF4500]'
                    : 'bg-white/[0.04] border-white/[0.1]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span className={`text-xs font-bold ${isActive ? 'text-[#FF4500]' : 'text-white/25'}`}>{i + 1}</span>
                )}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium ${isActive ? 'text-white/60' : isCompleted ? 'text-[#FF4500]/60' : 'text-white/20'}`}>
                {s.shortLabel}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-3 rounded-full transition-colors duration-300 -mt-4 ${isCompleted ? 'bg-[#FF4500]' : 'bg-white/[0.08]'}`} />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
