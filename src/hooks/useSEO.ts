import { useEffect } from 'react';

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  canonical?: string;
}

const BASE_URL = 'https://nextgenmods.com';
const SITE_NAME = 'NextGen Mods';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

function setMetaTag(property: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    document.title = config.title;

    setMetaTag('description', config.description);
    if (config.keywords) setMetaTag('keywords', config.keywords);

    setMetaTag('og:title', config.ogTitle || config.title, true);
    setMetaTag('og:description', config.ogDescription || config.description, true);
    setMetaTag('og:type', config.ogType || 'website', true);
    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:image', DEFAULT_OG_IMAGE, true);
    if (config.ogUrl) setMetaTag('og:url', config.ogUrl, true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', config.ogTitle || config.title);
    setMetaTag('twitter:description', config.ogDescription || config.description);
    setMetaTag('twitter:image', DEFAULT_OG_IMAGE);

    if (config.canonical) {
      setLinkTag('canonical', config.canonical);
    }
  }, [config.title, config.description, config.keywords, config.ogTitle, config.ogDescription, config.ogType, config.ogUrl, config.canonical]);
}

export const SEO_CONFIGS = {
  home: {
    title: 'NextGen Mods - Visualize Your Dream Car Build',
    description: 'Configure wraps, wheels, tint, exhaust, and suspension on real 3D car models. See every detail before you commit with NextGen Mods interactive configurator.',
    keywords: 'car configurator, 3D car builder, vinyl wrap preview, aftermarket wheels, window tint simulator, car modifications, custom car build',
    ogUrl: BASE_URL,
  },
  configurator: {
    title: 'Car Configurator - Build Your Dream Car | NextGen Mods',
    description: 'Use our real-time 3D configurator to preview wraps, wheels, tint, and exhaust on BMW and other performance vehicles. Build your perfect setup today.',
    keywords: 'car configurator, 3D car builder, wrap preview, wheel fitment, tint preview, exhaust sound, BMW configurator',
    ogUrl: `${BASE_URL}/configurator`,
  },
  findShops: {
    title: 'Find Local Car Mod Shops Near You | NextGen Mods',
    description: 'Discover and connect with verified local car modification shops. Get quotes for wraps, wheels, tint, and performance upgrades near your location.',
    keywords: 'car mod shops, wrap shops near me, wheel shops, tint installers, car modification shops, auto body shops',
    ogUrl: `${BASE_URL}/shops`,
  },
  pricing: {
    title: 'Pricing Plans for Shops | NextGen Mods',
    description: 'Affordable plans for car modification shops to get listed, receive leads, and grow their business with NextGen Mods. Start with our free Starter plan.',
    keywords: 'shop listing pricing, car mod shop plans, auto shop marketing, lead generation for shops',
    ogUrl: `${BASE_URL}/pricing`,
  },
  about: {
    title: 'About Us | NextGen Mods',
    description: 'Learn about NextGen Mods, the platform connecting car enthusiasts with the best local modification shops through interactive 3D visualization tools.',
    keywords: 'about NextGen Mods, car modification platform, 3D car visualization, automotive technology',
    ogUrl: `${BASE_URL}/about`,
  },
  contact: {
    title: 'Contact Us | NextGen Mods',
    description: 'Get in touch with the NextGen Mods team. We are here to help car enthusiasts and shop owners with questions, support, and partnership inquiries.',
    keywords: 'contact NextGen Mods, support, help, car modification platform',
    ogUrl: `${BASE_URL}/contact`,
  },
  auth: {
    title: 'Sign In | NextGen Mods',
    description: 'Sign in to your NextGen Mods account to access saved builds, manage your shop profile, and connect with local modification shops.',
    keywords: 'sign in, login, NextGen Mods account',
    ogUrl: `${BASE_URL}/auth`,
  },
  register: {
    title: 'Register Your Shop | NextGen Mods',
    description: 'Join the NextGen Mods platform and start receiving leads from car enthusiasts in your area. Register your car modification shop today.',
    keywords: 'register shop, list car mod shop, automotive business registration, shop onboarding',
    ogUrl: `${BASE_URL}/register`,
  },
  myBuilds: {
    title: 'My Saved Builds | NextGen Mods',
    description: 'View and manage your saved car builds. Load previous configurations, compare setups, and share your dream builds.',
    keywords: 'saved car builds, my configurations, car setups',
    ogUrl: `${BASE_URL}/my-builds`,
  },
  dashboard: {
    title: 'Shop Dashboard | NextGen Mods',
    description: 'Manage your shop profile, view leads, track reviews, and monitor your business performance on NextGen Mods.',
    keywords: 'shop dashboard, manage shop, leads, reviews, business analytics',
    ogUrl: `${BASE_URL}/dashboard`,
  },
} as const;
