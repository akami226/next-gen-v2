import { useEffect } from 'react';
import type { Shop } from '../types';

const SCRIPT_ID = 'structured-data-jsonld';

function injectJsonLd(data: Record<string, unknown>) {
  let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = SCRIPT_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  const el = document.getElementById(SCRIPT_ID);
  if (el) el.remove();
}

export function useWebApplicationSchema() {
  useEffect(() => {
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'NextGen Mods',
      url: 'https://nextgenmods.com',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      description: 'Interactive 3D car configurator for previewing wraps, wheels, tint, exhaust, and suspension modifications on real car models.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free 3D car configurator for car enthusiasts',
      },
    });
    return removeJsonLd;
  }, []);
}

export function useShopSchema(shop: Shop) {
  useEffect(() => {
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: shop.name,
      description: `${shop.name} offers ${shop.specialties.slice(0, 4).join(', ')} and more car modification services.`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: shop.city,
        addressRegion: shop.state,
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: shop.lat,
        longitude: shop.lng,
      },
      telephone: shop.phone,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: shop.rating.toFixed(1),
        reviewCount: shop.reviews,
        bestRating: '5',
        worstRating: '1',
      },
      image: shop.logoUrl || undefined,
      priceRange: '$$',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    });
    return removeJsonLd;
  }, [shop]);
}
