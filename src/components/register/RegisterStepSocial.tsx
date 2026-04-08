import { ArrowRight, ArrowLeft, Phone as PhoneIcon, Globe } from 'lucide-react';
import { InstagramIcon, FacebookIcon, TiktokIcon, TwitterIcon } from '../SocialIcons';
import type { RegistrationData } from '../../types';

interface Props {
  form: RegistrationData;
  updateField: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const INPUT_CLASS = 'w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#FF4500]/40 focus:shadow-[0_0_12px_rgba(255,69,0,0.06)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200';

export default function RegisterStepSocial({ form, updateField, onNext, onBack }: Props) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
          <Globe className="w-4 h-4 text-[#FF4500]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Social Media</h3>
          <p className="text-[10px] text-white/30">All fields are optional. Add the platforms you use.</p>
        </div>
      </div>

      <div className="space-y-4">
        <SocialField icon={<InstagramIcon className="w-4 h-4" />} label="Instagram" placeholder="https://instagram.com/yourshop" value={form.instagram} onChange={(v) => updateField('instagram', v)} />
        <SocialField icon={<FacebookIcon className="w-4 h-4" />} label="Facebook" placeholder="https://facebook.com/yourshop" value={form.facebook} onChange={(v) => updateField('facebook', v)} />
        <SocialField icon={<TiktokIcon className="w-4 h-4" />} label="TikTok" placeholder="https://tiktok.com/@yourshop" value={form.tiktok} onChange={(v) => updateField('tiktok', v)} />
        <SocialField icon={<TwitterIcon className="w-4 h-4" />} label="X / Twitter" placeholder="https://x.com/yourshop" value={form.twitter} onChange={(v) => updateField('twitter', v)} />
        <SocialField icon={<PhoneIcon className="w-4 h-4" />} label="WhatsApp" placeholder="+1 555 123 4567" value={form.whatsapp} onChange={(v) => updateField('whatsapp', v)} />
      </div>

      <div className="flex items-center justify-between mt-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-semibold rounded-xl hover:bg-white/[0.08] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button type="button" onClick={onNext} className="flex items-center gap-2 px-6 py-3 bg-[#FF4500] hover:bg-[#FF5722] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#FF4500]/20">
          Review Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SocialField({ icon, label, placeholder, value, onChange }: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-white/30">
        {icon}
      </div>
      <div className="flex-1">
        <label className="block text-[10px] text-white/30 mb-1">{label}</label>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={INPUT_CLASS} />
      </div>
    </div>
  );
}
