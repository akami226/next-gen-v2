import { useCallback } from 'react';
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { RegistrationData } from '../../types';

interface Props {
  form: RegistrationData;
  errors: Record<string, string>;
  setErrors: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  updateField: (field: string, value: string) => void;
  onNext: () => void;
}

export default function RegisterStepAccount({ form, errors, setErrors, updateField, onNext }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
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
    `w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#1a1a1a] border text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 ${
      errors[field]
        ? 'border-red-500/50 focus:border-red-500/70'
        : 'border-white/[0.08] focus:border-[#FF4500]/40 focus:shadow-[0_0_12px_rgba(255,69,0,0.06)]'
    }`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
          <User className="w-4 h-4 text-[#FF4500]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Create Your Account</h3>
          <p className="text-[10px] text-white/30">This will be used to access your shop dashboard</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-white/40 mb-1.5">Full Name <span className="text-[#FF4500]/60">*</span></label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="text" value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} placeholder="John Smith" className={inputClass('fullName')} />
          </div>
          {errors.fullName && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Email Address <span className="text-[#FF4500]/60">*</span></label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@example.com" className={inputClass('email')} />
          </div>
          {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Password <span className="text-[#FF4500]/60">*</span></label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Min. 8 characters" className={`${inputClass('password')} pr-11`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.password}</p>
            ) : (
              <p className="text-[10px] text-white/25 light:text-black/30 mt-1 ml-1">Password must be at least 8 characters</p>
            )}
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Confirm Password <span className="text-[#FF4500]/60">*</span></label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Re-enter password" className={`${inputClass('confirmPassword')} pr-11`} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.confirmPassword}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">Phone Number <span className="text-[#FF4500]/60">*</span></label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
            <input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="(555) 123-4567" className={inputClass('phone')} />
          </div>
          {errors.phone && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-[#FF4500] hover:bg-[#FF5722] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#FF4500]/20">
          Next Step
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
