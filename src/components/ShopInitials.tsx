interface ShopInitialsProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  xs: { container: 'w-6 h-6 rounded-md', text: 'text-[8px]' },
  sm: { container: 'w-8 h-8 rounded-lg', text: 'text-[10px]' },
  md: { container: 'w-10 h-10 rounded-xl', text: 'text-xs' },
  lg: { container: 'w-16 h-16 rounded-2xl', text: 'text-lg' },
  xl: { container: 'w-20 h-20 rounded-2xl', text: 'text-xl' },
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export default function ShopInitials({ name, size = 'md', className = '' }: ShopInitialsProps) {
  const s = SIZES[size];
  return (
    <div
      className={`${s.container} bg-[#0e0e0e] border-2 border-white/[0.1] flex items-center justify-center shrink-0 ${className}`}
    >
      <span className={`${s.text} font-black text-[#FF4500] tracking-tighter`}>
        {getInitials(name)}
      </span>
    </div>
  );
}

interface AvatarInitialsProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_SIZES = {
  xs: { container: 'w-6 h-6 rounded-md', text: 'text-[8px]' },
  sm: { container: 'w-7 h-7 rounded-lg', text: 'text-[9px]' },
  md: { container: 'w-9 h-9 rounded-xl', text: 'text-[10px]' },
  lg: { container: 'w-12 h-12 rounded-xl', text: 'text-sm' },
};

export function AvatarInitials({ name, size = 'md', className = '' }: AvatarInitialsProps) {
  const s = AVATAR_SIZES[size];
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${s.container} bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center shrink-0 ${className}`}
    >
      <span className={`${s.text} font-bold text-[#FF4500]`}>{initials}</span>
    </div>
  );
}

interface BrandingImageProps {
  src: string | null | undefined;
  fallbackName: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'logo' | 'avatar';
  className?: string;
}

export function BrandingImage({ src, fallbackName, size = 'md', type = 'logo', className = '' }: BrandingImageProps) {
  if (src) {
    const s = type === 'logo' ? SIZES[size] : AVATAR_SIZES[size as keyof typeof AVATAR_SIZES];
    return (
      <div className={`${s.container} overflow-hidden shrink-0 ${className}`}>
        <img src={src} alt={fallbackName} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (type === 'avatar') {
    return <AvatarInitials name={fallbackName} size={size as 'xs' | 'sm' | 'md' | 'lg'} className={className} />;
  }

  return <ShopInitials name={fallbackName} size={size} className={className} />;
}
