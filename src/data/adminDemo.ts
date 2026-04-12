export interface AdminShop {
  id: string;
  name: string;
  owner: string;
  email: string;
  city: string;
  state: string;
  plan: string;
  status: 'active' | 'pending' | 'suspended';
  leads: number;
  rating: number;
  revenue: number;
  joinDate: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  builds: number;
  isShopOwner: boolean;
  status: 'active' | 'suspended';
  joinDate: string;
  lastActive: string;
}

export interface AdminLead {
  id: string;
  customer: string;
  email: string;
  phone: string;
  shopName: string;
  car: string;
  configuredValue: number;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  date: string;
}

export interface AdminSubscription {
  id: string;
  shopName: string;
  owner: string;
  plan: string;
  price: number;
  status: 'active' | 'past_due' | 'cancelled';
  nextBilling: string;
  startDate: string;
}

export interface MonthlyRevenue {
  month: string;
  starter: number;
  professional: number;
  elite: number;
}

export interface WeeklySignup {
  week: string;
  shops: number;
  users: number;
}

export interface ActivityEvent {
  id: string;
  type: 'config' | 'lead' | 'signup' | 'review' | 'payment';
  message: string;
  actor: string;
  timestamp: string;
}

export interface ConfiguratorItem {
  id: string;
  name: string;
  category: 'wrap' | 'wheels' | 'exhaust' | 'tint' | 'suspension';
  price: number;
  inStock: boolean;
  thumbnail: string;
}

const CITIES = ['Los Angeles', 'Miami', 'Houston', 'Chicago', 'Phoenix', 'Dallas', 'San Diego', 'Denver', 'Atlanta', 'Seattle', 'Portland', 'Las Vegas'];
const STATES = ['CA', 'FL', 'TX', 'IL', 'AZ', 'TX', 'CA', 'CO', 'GA', 'WA', 'OR', 'NV'];
const SHOP_NAMES = ['Elite Wraps LA', 'SoCal AutoStyling', 'StreetVision Customs', 'Precision Auto Films', 'Blackout Studios', 'Chrome Delete Co', 'Apex Automotive', 'VeilWraps', 'Stealth Auto', 'TopCoat Pros', 'WrapKings', 'AutoAesthetic HQ'];
const OWNERS = ['Marcus Chen', 'Sarah Mitchell', 'David Park', 'Jessica Ramirez', 'Ryan O\'Connor', 'Nina Patel', 'Carlos Mendez', 'James Wilson', 'Emily Rodriguez', 'Alex Kim', 'Brandon Lee', 'Sophia Turner'];
const USER_NAMES = ['Tyler Brooks', 'Mia Chang', 'Jordan Hayes', 'Olivia Foster', 'Ethan Hughes', 'Chloe Martinez', 'Noah Thompson', 'Ava Price', 'Liam Cooper', 'Emma Sullivan', 'Mason Reed', 'Zoe Bennett', 'Lucas Murphy', 'Lily Collins', 'Jack Watson', 'Grace Kim'];

export function getAdminShops(): AdminShop[] {
  return SHOP_NAMES.map((name, i) => ({
    id: `shop-${i + 1}`,
    name,
    owner: OWNERS[i],
    email: `${OWNERS[i].toLowerCase().replace(/[' ]/g, '.')}@email.com`,
    city: CITIES[i],
    state: STATES[i],
    plan: i < 4 ? 'starter' : i < 9 ? 'professional' : 'elite',
    status: i === 2 ? 'pending' : i === 7 ? 'suspended' : 'active',
    leads: Math.floor(Math.random() * 40) + 5,
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    revenue: i < 4 ? 29 : i < 9 ? 79 : 149,
    joinDate: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  }));
}

export function getAdminUsers(): AdminUser[] {
  return USER_NAMES.map((name, i) => ({
    id: `user-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
    builds: Math.floor(Math.random() * 8) + 1,
    isShopOwner: i < 4,
    status: i === 10 ? 'suspended' : 'active',
    joinDate: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    lastActive: `2026-04-0${Math.floor(Math.random() * 7) + 1}`,
  }));
}

export function getAdminLeads(): AdminLead[] {
  const cars = ['BMW M4 G82', 'BMW M4 F82', 'BMW M6 Gran Coupe'];
  const phones = ['(310) 555-0142', '(305) 555-0198', '(713) 555-0167', '(312) 555-0134', '(602) 555-0189', '(214) 555-0156', '(858) 555-0123', '(303) 555-0178', '(404) 555-0145', '(206) 555-0190', '(503) 555-0112', '(702) 555-0168', '(213) 555-0135', '(786) 555-0191', '(469) 555-0147'];
  const values = [8500, 12400, 6200, 15800, 9700, 4300, 11200, 7600, 13500, 5900, 10800, 8200, 14600, 3800, 9100];
  const customers = ['Tyler Brooks', 'Mia Chang', 'Jordan Hayes', 'Olivia Foster', 'Ethan Hughes', 'Chloe Martinez', 'Noah Thompson', 'Ava Price', 'Liam Cooper', 'Emma Sullivan', 'Mason Reed', 'Zoe Bennett', 'Lucas Murphy', 'Lily Collins', 'Jack Watson'];
  return customers.map((c, i) => ({
    id: `lead-${i + 1}`,
    customer: c,
    email: `${c.toLowerCase().replace(' ', '.')}@gmail.com`,
    phone: phones[i],
    shopName: SHOP_NAMES[i % SHOP_NAMES.length],
    car: cars[i % cars.length],
    configuredValue: values[i],
    status: i < 4 ? 'new' : i < 8 ? 'contacted' : i < 12 ? 'qualified' : 'closed',
    date: `2026-04-${String(Math.min(i + 1, 12)).padStart(2, '0')}`,
  }));
}

export function getAdminSubscriptions(): AdminSubscription[] {
  return SHOP_NAMES.map((name, i) => ({
    id: `sub-${i + 1}`,
    shopName: name,
    owner: OWNERS[i],
    plan: i < 4 ? 'starter' : i < 9 ? 'professional' : 'elite',
    price: i < 4 ? 29 : i < 9 ? 79 : 149,
    status: i === 7 ? 'past_due' : i === 5 ? 'cancelled' : 'active',
    nextBilling: `2026-05-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    startDate: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  }));
}

export function getMonthlyRevenue(): MonthlyRevenue[] {
  return [
    { month: 'Jan', starter: 116, professional: 316, elite: 298 },
    { month: 'Feb', starter: 145, professional: 395, elite: 447 },
    { month: 'Mar', starter: 116, professional: 474, elite: 596 },
    { month: 'Apr', starter: 116, professional: 395, elite: 745 },
  ];
}

export function getWeeklySignups(): WeeklySignup[] {
  return [
    { week: 'Week 1', shops: 3, users: 12 },
    { week: 'Week 2', shops: 5, users: 18 },
    { week: 'Week 3', shops: 2, users: 15 },
    { week: 'Week 4', shops: 4, users: 22 },
  ];
}

export function getAdminStats() {
  const shops = getAdminShops();
  const users = getAdminUsers();
  const leads = getAdminLeads();
  const revenue = getMonthlyRevenue();
  const latestRevenue = revenue[revenue.length - 1];

  return {
    totalShops: shops.length,
    totalUsers: users.length,
    totalLeads: leads.length,
    monthlyRevenue: latestRevenue.starter + latestRevenue.professional + latestRevenue.elite,
    newSignupsThisWeek: 4,
    activeSubscriptions: shops.filter((s) => s.status === 'active').length,
    pendingApprovals: shops.filter((s) => s.status === 'pending').length,
  };
}

export function getRecentActivity(): ActivityEvent[] {
  return [
    { id: 'act-1', type: 'config', message: 'configured a BMW M4 G82 with Matte Black wrap + BBS wheels', actor: 'Tyler Brooks', timestamp: '2 min ago' },
    { id: 'act-2', type: 'lead', message: 'submitted a build quote to Elite Wraps LA', actor: 'Mia Chang', timestamp: '8 min ago' },
    { id: 'act-3', type: 'signup', message: 'registered as a new shop', actor: 'Apex Automotive', timestamp: '15 min ago' },
    { id: 'act-4', type: 'review', message: 'left a 5-star review for SoCal AutoStyling', actor: 'Jordan Hayes', timestamp: '22 min ago' },
    { id: 'act-5', type: 'payment', message: 'upgraded from Starter to Professional plan', actor: 'Precision Auto Films', timestamp: '34 min ago' },
    { id: 'act-6', type: 'config', message: 'configured a BMW M6 Gran Coupe with Mirror Chrome wrap', actor: 'Olivia Foster', timestamp: '41 min ago' },
    { id: 'act-7', type: 'lead', message: 'submitted a build quote to Blackout Studios', actor: 'Ethan Hughes', timestamp: '1 hr ago' },
    { id: 'act-8', type: 'signup', message: 'joined as a new user', actor: 'Grace Kim', timestamp: '1 hr ago' },
    { id: 'act-9', type: 'review', message: 'left a 4-star review for Chrome Delete Co', actor: 'Chloe Martinez', timestamp: '2 hr ago' },
    { id: 'act-10', type: 'payment', message: 'renewed Elite subscription', actor: 'WrapKings', timestamp: '3 hr ago' },
  ];
}

export function getEngagementData() {
  return [
    { day: 'Mon', configurations: 42, leads: 18, signups: 5 },
    { day: 'Tue', configurations: 56, leads: 24, signups: 8 },
    { day: 'Wed', configurations: 38, leads: 15, signups: 3 },
    { day: 'Thu', configurations: 67, leads: 31, signups: 11 },
    { day: 'Fri', configurations: 73, leads: 28, signups: 9 },
    { day: 'Sat', configurations: 89, leads: 35, signups: 14 },
    { day: 'Sun', configurations: 54, leads: 20, signups: 6 },
  ];
}

export function getLeadStatusBreakdown() {
  return [
    { status: 'New', count: 24, color: '#3B82F6' },
    { status: 'Contacted', count: 18, color: '#F59E0B' },
    { status: 'Qualified', count: 12, color: '#10B981' },
    { status: 'Closed', count: 8, color: '#6B7280' },
  ];
}

export function getConfiguratorItems(): ConfiguratorItem[] {
  return [
    { id: 'wrap-1', name: 'Matte Black', category: 'wrap', price: 2400, inStock: true, thumbnail: '#1a1a1a' },
    { id: 'wrap-2', name: 'Gloss Hot Rod Red', category: 'wrap', price: 2700, inStock: true, thumbnail: '#cc0000' },
    { id: 'wrap-3', name: 'Satin Dark Grey', category: 'wrap', price: 2600, inStock: true, thumbnail: '#3a3a3a' },
    { id: 'wrap-4', name: 'Super Gloss Midnight Purple', category: 'wrap', price: 3000, inStock: true, thumbnail: '#1a0033' },
    { id: 'wrap-5', name: 'Brushed Titanium', category: 'wrap', price: 3300, inStock: false, thumbnail: '#8a8a8a' },
    { id: 'wrap-6', name: 'Mirror Chrome', category: 'wrap', price: 4750, inStock: true, thumbnail: '#e8e8e8' },
    { id: 'wrap-7', name: 'Carbon Fiber Black', category: 'wrap', price: 3600, inStock: true, thumbnail: '#222222' },
    { id: 'wrap-8', name: 'Ocean Shift Blue/Green', category: 'wrap', price: 3850, inStock: true, thumbnail: '#006666' },
    { id: 'wheel-1', name: 'BBS LM Forged', category: 'wheels', price: 3000, inStock: true, thumbnail: '#d8d8d8' },
    { id: 'wheel-2', name: 'Vossen HF-5', category: 'wheels', price: 2200, inStock: true, thumbnail: '#0a0a0a' },
    { id: 'wheel-3', name: 'Work Emotion CR Kiwami', category: 'wheels', price: 2550, inStock: false, thumbnail: '#8B6914' },
    { id: 'wheel-4', name: 'HRE P101', category: 'wheels', price: 4000, inStock: true, thumbnail: '#C5A55A' },
    { id: 'exh-1', name: 'Akrapovic Evolution', category: 'exhaust', price: 4200, inStock: true, thumbnail: '#B0B0B0' },
    { id: 'exh-2', name: 'Borla ATAK', category: 'exhaust', price: 1800, inStock: true, thumbnail: '#8C8C8C' },
    { id: 'tint-1', name: 'Light Tint (35%)', category: 'tint', price: 275, inStock: true, thumbnail: '#555555' },
    { id: 'tint-2', name: 'Medium Tint (20%)', category: 'tint', price: 375, inStock: true, thumbnail: '#333333' },
    { id: 'tint-3', name: 'Limo Tint (5%)', category: 'tint', price: 425, inStock: true, thumbnail: '#111111' },
    { id: 'susp-1', name: 'KW V3 Coilovers', category: 'suspension', price: 1700, inStock: true, thumbnail: '#FFD700' },
    { id: 'susp-2', name: 'Air Lift Performance 3P', category: 'suspension', price: 2750, inStock: true, thumbnail: '#FF4500' },
    { id: 'susp-3', name: 'ReadyLIFT 4" Kit', category: 'suspension', price: 1750, inStock: false, thumbnail: '#2ECC71' },
  ];
}
