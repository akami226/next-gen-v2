import { motion } from 'framer-motion';
import { BadgeCheck, Star, MapPin, Globe } from 'lucide-react';
import type { Shop, ShopSocials } from '../types';
import { InstagramIcon, FacebookIcon, TiktokIcon, TwitterIcon, WhatsappIcon } from './SocialIcons';
import { getInitials } from './ShopInitials';

interface ShopProfileHeroProps {
  shop: Shop;
}

const SOCIAL_LINKS: { key: keyof ShopSocials; icon: React.ReactNode; getUrl: (v: string) => string; label: string }[] = [
  { key: 'instagram', icon: <InstagramIcon className="w-4 h-4" />, getUrl: (v) => v, label: 'Instagram' },
  { key: 'facebook', icon: <FacebookIcon className="w-4 h-4" />, getUrl: (v) => v, label: 'Facebook' },
  { key: 'tiktok', icon: <TiktokIcon className="w-4 h-4" />, getUrl: (v) => v, label: 'TikTok' },
  { key: 'twitter', icon: <TwitterIcon className="w-4 h-4" />, getUrl: (v) => v, label: 'X' },
  { key: 'whatsapp', icon: <WhatsappIcon className="w-4 h-4" />, getUrl: (v) => `https://wa.me/${v.replace(/\D/g, '')}`, label: 'WhatsApp' },
  { key: 'website', icon: <Globe className="w-4 h-4" />, getUrl: (v) => v, label: 'Website' },
];

export default function ShopProfileHero({ shop }: ShopProfileHeroProps) {
  const bannerUrl = shop.bannerUrl || shop.gallery[0];
  const activeSocials = shop.socials
    ? SOCIAL_LINKS.filter((s) => shop.socials?.[s.key]?.trim())
    : [];

  return (
    <div className="relative">
      <div className="h-48 sm:h-64 lg:h-72 overflow-hidden rounded-2xl border border-white/[0.06]">
        <img
          src={bannerUrl}
          alt={`${shop.name} banner`}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 rounded-2xl" style={{ background: `linear-gradient(to top, var(--bg-body), color-mix(in srgb, var(--bg-body) 60%, transparent), transparent)` }} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-5 sm:pb-6">
        <div className="flex items-end gap-4 sm:gap-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white/[0.1] shrink-0 shadow-2xl"
          >
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#0e0e0e] flex items-center justify-center">
                <span className="text-lg sm:text-xl font-black text-[#FF4500] tracking-tighter">
                  {getInitials(shop.name)}
                </span>
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0 pb-0.5">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                {shop.name}
              </h1>
              {shop.verified && (
                <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF4500] shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-white">{shop.rating}</span>
                <span className="text-xs text-white/40">({shop.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/40">{shop.city}, {shop.state}</span>
              </div>
            </div>

            {activeSocials.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5">
                {activeSocials.map((social) => (
                  <a
                    key={social.key}
                    href={social.getUrl(shop.socials![social.key]!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.label}
                    className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.12] hover:border-white/[0.15] transition-all duration-200"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
