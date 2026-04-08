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
  shopName: string;
  car: string;
  status: 'pending' | 'contacted' | 'completed';
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
  const customers = ['Tyler Brooks', 'Mia Chang', 'Jordan Hayes', 'Olivia Foster', 'Ethan Hughes', 'Chloe Martinez', 'Noah Thompson', 'Ava Price', 'Liam Cooper', 'Emma Sullivan', 'Mason Reed', 'Zoe Bennett', 'Lucas Murphy', 'Lily Collins', 'Jack Watson'];
  return customers.map((c, i) => ({
    id: `lead-${i + 1}`,
    customer: c,
    shopName: SHOP_NAMES[i % SHOP_NAMES.length],
    car: cars[i % cars.length],
    status: i < 5 ? 'pending' : i < 10 ? 'contacted' : 'completed',
    date: `2026-04-0${Math.min(i + 1, 7)}`,
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
