import { FormEvent, useCallback, type ReactNode } from 'react';
import { ArrowLeft, Loader2, Store, AlertCircle, Mail, Phone, MapPin, Wrench, Globe } from 'lucide-react';
import type { RegistrationData } from '../../types';

interface Props {
  form: RegistrationData;
  submitting: boolean;
  submitError: string;
  onSubmit: () => void;
  onBack: () => void;
}

export default function RegisterStepConfirm({ form, submitting, submitError, onSubmit, onBack }: Props) {
  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;
      onSubmit();
    },
    [onSubmit, submitting]
  );

  const socials = [
    form.instagram && `Instagram: ${form.instagram}`,
    form.facebook && `Facebook: ${form.facebook}`,
    form.tiktok && `TikTok: ${form.tiktok}`,
    form.twitter && `X/Twitter: ${form.twitter}`,
    form.whatsapp && `WhatsApp: ${form.whatsapp}`,
  ].filter(Boolean);

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
          <Store className="w-4 h-4 text-[#FF4500]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white dark:text-white light:text-gray-900">Review & Confirm</h3>
          <p className="text-[10px] text-white/30 dark:text-white/30 light:text-gray-500">Please verify all your details before submitting</p>
        </div>
      </div>

      <div className="space-y-4">
        <SummarySection title="Account">
          <SummaryRow icon={<Mail className="w-3.5 h-3.5" />} label="Name" value={form.fullName} />
          <SummaryRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={form.email} />
          <SummaryRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={form.phone} />
        </SummarySection>

        <SummarySection title="Shop Details">
          <SummaryRow icon={<Store className="w-3.5 h-3.5" />} label="Shop Name" value={form.shopName} />
          <SummaryRow icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={`${form.shopAddress}, ${form.shopCity}, ${form.shopState} ${form.shopZip}`} />
          <SummaryRow icon={<Phone className="w-3.5 h-3.5" />} label="Shop Phone" value={form.shopPhone} />
          <SummaryRow icon={<Mail className="w-3.5 h-3.5" />} label="Shop Email" value={form.shopEmail} />
          {form.shopWebsite && <SummaryRow icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={form.shopWebsite} />}
          <div className="pt-2 border-t border-white/[0.04] dark:border-white/[0.04] light:border-black/[0.08]">
            <p className="text-[10px] text-white/25 dark:text-white/25 light:text-gray-500 mb-1.5">Description</p>
            <p className="text-xs text-white/45 dark:text-white/45 light:text-gray-700 leading-relaxed">{form.shopDescription}</p>
          </div>
          <div className="pt-2 border-t border-white/[0.04] dark:border-white/[0.04] light:border-black/[0.08]">
            <div className="flex items-start gap-2">
              <Wrench className="w-3.5 h-3.5 text-white/20 dark:text-white/20 light:text-gray-400 mt-0.5 shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {form.services.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-[#FF4500]/10 text-[10px] font-medium text-[#FF4500]/80">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </SummarySection>

        {socials.length > 0 && (
          <SummarySection title="Social Media">
            {socials.map((s) => (
              <p key={s} className="text-xs text-white/45 dark:text-white/45 light:text-gray-700">{s}</p>
            ))}
          </SummarySection>
        )}
      </div>

      {submitError && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 mt-4">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-[11px] text-red-700 dark:text-red-400 font-medium">{submitError}</span>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
        <button type="button" onClick={onBack} disabled={submitting} className="flex items-center justify-center gap-2 px-5 py-3 w-full sm:w-auto bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.1] text-white/50 dark:text-white/50 light:text-gray-600 text-sm font-semibold rounded-xl hover:bg-white/[0.08] dark:hover:bg-white/[0.08] light:hover:bg-black/[0.06] transition-colors disabled:opacity-50">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto bg-[#FF4500] hover:bg-[#FF5722] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#FF4500]/20 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Confirm & Submit'
          )}
        </button>
      </div>
    </form>
  );
}

function SummarySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white/[0.02] dark:bg-white/[0.02] light:bg-white border border-white/[0.06] dark:border-white/[0.06] light:border-black/[0.08] rounded-xl p-4">
      <h4 className="text-[10px] text-[#FF4500]/60 dark:text-[#FF4500]/60 light:text-[#2563EB] font-semibold uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-white/20 dark:text-white/20 light:text-gray-400">{icon}</span>
      <span className="text-[10px] text-white/25 dark:text-white/25 light:text-gray-500 w-20 shrink-0">{label}</span>
      <span className="text-xs text-white/55 dark:text-white/55 light:text-gray-800 truncate">{value}</span>
    </div>
  );
}
