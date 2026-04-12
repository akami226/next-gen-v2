export interface Wrap {
  brand: string;
  name: string;
  hex: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  envMapIntensity?: number;
  iridescence?: number;
  iridescenceIOR?: number;
  reflectivity?: number;
  materialType: 'standard' | 'physical';
}

export interface Wheel {
  brand: string;
  name: string;
  color: string;
  type: string;
  price: number;
}

export interface SuspensionOption {
  id: string;
  label: string;
  brand: string;
  value: number;
}

export interface CarExhaustOption {
  id: string;
  brand: string;
  product: string;
  file: string;
  description: string;
  price: number;
}

export interface CarOption {
  brand: string;
  model: string;
  category: string;
  file: string;
  exhaustOptions: CarExhaustOption[];
}

export interface TintOption {
  id: string;
  name: string;
  brand: string;
  vlt: string;
  opacity: number;
  color: string | null;
  material: {
    opacity: number;
    color: string;
    roughness: number;
    metalness: number;
  };
}

export interface WheelOption {
  id: string;
  name: string;
  brand: string;
  hex: string;
  material: {
    color: string;
    roughness: number;
    metalness: number;
    envMapIntensity: number;
  };
}

export interface ShopReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
}

export interface ShopHours {
  day: string;
  open: string;
  close: string;
  closed?: boolean;
}

export interface ShopSocials {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  twitter?: string;
  whatsapp?: string;
  website?: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  hours: ShopHours[];
  gallery: string[];
  customerReviews: ShopReview[];
  socials?: ShopSocials;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}

export interface BuildConfig {
  car: string;
  wrap: string;
  wheels: string;
  tint: string;
  exhaust: string;
}

export type NotificationType = 'new_lead' | 'new_review' | 'new_quote';

export interface ShopNotification {
  id: string;
  shop_owner_id: string;
  type: NotificationType;
  title: string;
  message: string;
  customer_name: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  shopName: string;
  shopAddress: string;
  shopCity: string;
  shopState: string;
  shopZip: string;
  shopPhone: string;
  shopEmail: string;
  shopWebsite: string;
  shopDescription: string;
  services: string[];
  instagram: string;
  facebook: string;
  tiktok: string;
  twitter: string;
  whatsapp: string;
}
