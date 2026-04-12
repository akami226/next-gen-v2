import { useCallback } from 'react';
import { Store, ArrowRight, ArrowLeft } from 'lucide-react';
import { validateZip } from '../../lib/zipValidation';
import { US_STATES } from '../../data/usStates';
import type { RegistrationData } from '../../types';

interface Props {
  form: RegistrationData;
  errors: Record<string, string>;
  setErrors: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  updateField: (field: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const SERVICES = [
  'Vinyl Wraps',
  'Paint Protection Film (PPF)',
  'Window Tint',
  'Wheel Installation',
  'Body Kits',
  'Suspension',
  'Exhaust Systems',
  'Full Custom Builds',
  'Interior Work',
  'Paint and Bodywork',
] as const;

export default function RegisterStepShop({ form, errors, setErrors, updateField, onNext, onBack }: Props) {
  const toggleService = (service: string) => {
    const next = form.services.includes(service)
      ? form.services.filter((s) => s !== service)
      : [...form.services, service];
    updateField('services', next);
  };

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.shopName.trim()) errs.shopName = 'Required';
    if (!form.shopAddress.trim()) errs.shopAddress = 'Required';
    if (!form.shopCity.trim()) errs.shopCity = 'Required';
    if (!form.shopState) errs.shopState = 'Required';
    const zipErr = validateZip(form.shopZip.trim());
    if (zipErr) errs.shopZip = zipErr;
    if (!form.shopPhone.trim()) errs.shopPhone = 'Required';
    if (!form.shopEmail.trim()) {
      errs.shopEmail = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.shopEmail)) {
      errs.shopEmail = 'Enter a valid email';
    }
    if (!form.shopDescription.trim()) {
      errs.shopDescription = 'Required';
    } else if (form.shopDescription.trim().length < 20) {
      errs.shopDescription = 'At least 20 characters';
    }
    if (form.services.length === 0) errs.services = 'Select at least one service';
    return errs;
  }, [form]);

  const handleNext = useCallback(() => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(() => errs);
      return;
    }
    onNext();
  }, [validate, setErrors, onNext]);

  const inputClass = (field: string) =>
    `w-full bg-white/[0.04] border ${
      errors[field]
        ? 'border-red-500/50'
        : 'border-white/[0.08] focus:border-[#FF4500]/40 focus:shadow-[0_0_12px_rgba(255,69,0,0.06)]'
    } rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
          <Store className="w-4 h-4 text-[#FF4500]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Shop Details</h3>
          <p className="text-[10px] text-white/30">Tell us about your business</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Shop Name <span className="text-[#FF4500]/60">*</span></label>
          <input type="text" value={form.shopName} onChange={(e) => updateField('shopName', e.target.value)} placeholder="e.g. West Coast Customs" className={inputClass('shopName')} />
          {errors.shopName && <p className="text-[10px] text-red-400 mt-1">{errors.shopName}</p>}
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Address <span className="text-[#FF4500]/60">*</span></label>
          <input type="text" value={form.shopAddress} onChange={(e) => updateField('shopAddress', e.target.value)} placeholder="123 Main St" className={inputClass('shopAddress')} />
          {errors.shopAddress && <p className="text-[10px] text-red-400 mt-1">{errors.shopAddress}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-white/40 mb-1.5">City <span className="text-[#FF4500]/60">*</span></label>
            <input type="text" value={form.shopCity} onChange={(e) => updateField('shopCity', e.target.value)} placeholder="Los Angeles" className={inputClass('shopCity')} />
            {errors.shopCity && <p className="text-[10px] text-red-400 mt-1">{errors.shopCity}</p>}
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">State <span className="text-[#FF4500]/60">*</span></label>
            <select value={form.shopState} onChange={(e) => updateField('shopState', e.target.value)} className={`${inputClass('shopState')} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#1a1a1a] text-white/40">Select</option>
              {US_STATES.map((s) => (
                <option key={s} value={s} className="bg-[#1a1a1a] text-white">{s}</option>
              ))}
            </select>
            {errors.shopState && <p className="text-[10px] text-red-400 mt-1">{errors.shopState}</p>}
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Zip Code <span className="text-[#FF4500]/60">*</span></label>
            <input type="text" inputMode="numeric" maxLength={5} value={form.shopZip} onChange={(e) => updateField('shopZip', e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="90001" className={inputClass('shopZip')} />
            {errors.shopZip && <p className="text-[10px] text-red-400 mt-1">{errors.shopZip}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Shop Phone <span className="text-[#FF4500]/60">*</span></label>
            <input type="tel" value={form.shopPhone} onChange={(e) => updateField('shopPhone', e.target.value)} placeholder="(555) 123-4567" className={inputClass('shopPhone')} />
            {errors.shopPhone && <p className="text-[10px] text-red-400 mt-1">{errors.shopPhone}</p>}
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Shop Email <span className="text-[#FF4500]/60">*</span></label>
            <input type="email" value={form.shopEmail} onChange={(e) => updateField('shopEmail', e.target.value)} placeholder="shop@example.com" className={inputClass('shopEmail')} />
            {errors.shopEmail && <p className="text-[10px] text-red-400 mt-1">{errors.shopEmail}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Website <span className="text-white/20">(optional)</span></label>
          <input type="text" value={form.shopWebsite} onChange={(e) => updateField('shopWebsite', e.target.value)} placeholder="https://yourshop.com" className={inputClass('shopWebsite')} />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Shop Description <span className="text-[#FF4500]/60">*</span> <span className="text-white/15">({form.shopDescription.length}/300)</span></label>
          <textarea value={form.shopDescription} onChange={(e) => { if (e.target.value.length <= 300) updateField('shopDescription', e.target.value); }} placeholder="Tell customers what makes your shop unique..." rows={3} className={`${inputClass('shopDescription')} resize-none`} />
          <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min((form.shopDescription.length / 300) * 100, 100)}%`, backgroundColor: form.shopDescription.length >= 300 ? '#ef4444' : form.shopDescription.length >= 240 ? '#f59e0b' : 'var(--accent)' }} />
          </div>
          {errors.shopDescription && <p className="text-[10px] text-red-400 mt-1">{errors.shopDescription}</p>}
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2">Services Offered <span className="text-[#FF4500]/60">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SERVICES.map((service) => {
              const active = form.services.includes(service);
              return (
                <button key={service} type="button" onClick={() => toggleService(service)} className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 text-left ${active ? 'bg-[#FF4500]/15 border-[#FF4500]/40 text-[#FF4500]' : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/60'}`}>
                  {service}
                </button>
              );
            })}
          </div>
          {errors.services && <p className="text-[10px] text-red-400 mt-2">{errors.services}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-semibold rounded-xl hover:bg-white/[0.08] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-[#FF4500] hover:bg-[#FF5722] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#FF4500]/20">
          Next Step
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
