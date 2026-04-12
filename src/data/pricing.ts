import type { Wrap } from '../types';

interface PriceRange {
  low: number;
  high: number;
}

const WRAP_PRICES: Record<string, PriceRange> = {
  'Matte Black': { low: 2000, high: 2800 },
  'Gloss Hot Rod Red': { low: 2200, high: 3200 },
  'Satin Dark Grey': { low: 2200, high: 3000 },
  'Super Gloss Midnight Purple': { low: 2500, high: 3500 },
  'Brushed Titanium': { low: 2800, high: 3800 },
  'Mirror Chrome': { low: 4000, high: 5500 },
  'Carbon Fiber Black': { low: 3000, high: 4200 },
  'Ocean Shift Blue/Green': { low: 3200, high: 4500 },
};

const WHEEL_PRICES: Record<string, PriceRange> = {
  stock: { low: 0, high: 0 },
  bbs: { low: 2600, high: 3400 },
  vossen: { low: 1800, high: 2600 },
  work: { low: 2100, high: 3000 },
  hre: { low: 3200, high: 4800 },
};

const TINT_PRICES: Record<string, PriceRange> = {
  no_tint: { low: 0, high: 0 },
  light_tint: { low: 200, high: 350 },
  medium_tint: { low: 300, high: 450 },
  limo_tint: { low: 350, high: 500 },
};

const SUSPENSION_THRESHOLDS = {
  stock: { min: -0.04, max: 0.04 },
};

function getSuspensionPrice(height: number): PriceRange {
  if (height >= SUSPENSION_THRESHOLDS.stock.min && height <= SUSPENSION_THRESHOLDS.stock.max) {
    return { low: 0, high: 0 };
  }
  if (height <= -0.2) return { low: 2000, high: 3500 };
  if (height < SUSPENSION_THRESHOLDS.stock.min) return { low: 1200, high: 2200 };
  if (height > 0.19) return { low: 1500, high: 2500 };
  return { low: 1000, high: 2000 };
}

export interface BuildPriceBreakdown {
  wrap: PriceRange;
  wheels: PriceRange;
  tint: PriceRange;
  exhaust: PriceRange;
  suspension: PriceRange;
  total: PriceRange;
}

export function calculateBuildPrice(
  wrap: Wrap,
  wheelId: string,
  tintId: string,
  suspensionHeight: number,
  exhaustPrice: number
): BuildPriceBreakdown {
  const wrapPrice = WRAP_PRICES[wrap.name] ?? { low: 2000, high: 3000 };
  const wheelsPrice = WHEEL_PRICES[wheelId] ?? { low: 0, high: 0 };
  const tintPrice = TINT_PRICES[tintId] ?? { low: 0, high: 0 };
  const suspPrice = getSuspensionPrice(suspensionHeight);
  const exhPrice: PriceRange = exhaustPrice > 0
    ? { low: exhaustPrice, high: exhaustPrice }
    : { low: 0, high: 0 };

  return {
    wrap: wrapPrice,
    wheels: wheelsPrice,
    tint: tintPrice,
    exhaust: exhPrice,
    suspension: suspPrice,
    total: {
      low: wrapPrice.low + wheelsPrice.low + tintPrice.low + exhPrice.low + suspPrice.low,
      high: wrapPrice.high + wheelsPrice.high + tintPrice.high + exhPrice.high + suspPrice.high,
    },
  };
}

export function formatPrice(value: number): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
