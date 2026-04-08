import type { Shop } from '../types';

export interface DemoLead {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_city: string;
  contact_time: string;
  notes: string;
  car_config: {
    car: string;
    wrap: string;
    wheels: string;
    tint: string;
    exhaust: string;
  };
  status: 'pending' | 'contacted' | 'completed';
  created_at: string;
}

export interface DemoReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
  photos?: string[];
  reply?: string;
  reply_date?: string;
}

export interface DailyMetric {
  date: string;
  label: string;
  views: number;
  leads: number;
}

export function getDemoLeads(): DemoLead[] {
  return [
    {
      id: 'lead-1',
      customer_name: 'Marcus Chen',
      customer_email: 'marcus.chen@email.com',
      customer_phone: '(310) 555-0142',
      customer_city: 'Los Angeles, CA',
      contact_time: 'Morning',
      notes: 'Looking for a full matte black wrap on my 2024 M4. Want to discuss ceramic coating options too.',
      car_config: { car: 'BMW M4 G82', wrap: '3M 1080 Matte Black', wheels: 'BBS LM Forged', tint: 'XPEL XR Plus 35% VLT', exhaust: 'Akrapovic Evolution' },
      status: 'pending',
      created_at: '2026-04-07T09:15:00Z',
    },
    {
      id: 'lead-2',
      customer_name: 'Sarah Mitchell',
      customer_email: 'sarah.m@email.com',
      customer_phone: '(818) 555-0278',
      customer_city: 'Burbank, CA',
      contact_time: 'Afternoon',
      notes: 'Need quotes for wheel installation and alignment. Already have the wheels.',
      car_config: { car: 'BMW M4 F82', wrap: 'Avery SW900 Satin Dark Grey', wheels: 'Vossen HF-5', tint: 'LLumar CTX 50% VLT', exhaust: 'Borla S-Type' },
      status: 'contacted',
      created_at: '2026-04-06T14:30:00Z',
    },
    {
      id: 'lead-3',
      customer_name: 'David Park',
      customer_email: 'dpark@email.com',
      customer_phone: '(213) 555-0199',
      customer_city: 'Pasadena, CA',
      contact_time: 'Anytime',
      notes: 'Full build: wrap, wheels, tint, exhaust. Budget around $15k. Want to see the car in person first.',
      car_config: { car: 'BMW M6 Gran Coupe', wrap: '3M 1080 Gloss Hot Rod Red', wheels: 'HRE P101', tint: '3M Crystalline 5% VLT', exhaust: 'Akrapovic Slip-On' },
      status: 'completed',
      created_at: '2026-04-05T11:00:00Z',
    },
    {
      id: 'lead-4',
      customer_name: 'Jessica Ramirez',
      customer_email: 'jess.r@email.com',
      customer_phone: '(626) 555-0334',
      customer_city: 'Glendale, CA',
      contact_time: 'Evening',
      notes: 'Interested in ceramic tint for all windows including windshield. How long does it take?',
      car_config: { car: 'BMW M4 G82', wrap: 'HEXIS Brushed Titanium', wheels: 'Enkei RPF1', tint: 'XPEL XR Plus 35% VLT', exhaust: 'Akrapovic Evolution' },
      status: 'pending',
      created_at: '2026-04-07T16:45:00Z',
    },
    {
      id: 'lead-5',
      customer_name: 'Ryan O\'Connor',
      customer_email: 'ryan.oc@email.com',
      customer_phone: '(323) 555-0556',
      customer_city: 'Santa Monica, CA',
      contact_time: 'Morning',
      notes: 'Chrome delete + tint package. Also want to discuss PPF for the front end.',
      car_config: { car: 'BMW M4 F82', wrap: '3M Carbon Fiber Black', wheels: 'Work Emotion CR Kiwami', tint: 'LLumar CTX 50% VLT', exhaust: 'Eisenmann Race' },
      status: 'pending',
      created_at: '2026-04-04T08:20:00Z',
    },
    {
      id: 'lead-6',
      customer_name: 'Nina Patel',
      customer_email: 'nina.p@email.com',
      customer_phone: '(562) 555-0187',
      customer_city: 'Long Beach, CA',
      contact_time: 'Afternoon',
      notes: 'Want the Akrapovic exhaust installed. Already purchased it. Need a quote for labor only.',
      car_config: { car: 'BMW M4 G82', wrap: '3M 1080 Matte Black', wheels: 'BBS LM Forged', tint: '3M Crystalline 5% VLT', exhaust: 'Akrapovic Evolution' },
      status: 'contacted',
      created_at: '2026-04-03T13:10:00Z',
    },
    {
      id: 'lead-7',
      customer_name: 'Carlos Mendez',
      customer_email: 'carlos.m@email.com',
      customer_phone: '(747) 555-0421',
      customer_city: 'Woodland Hills, CA',
      contact_time: 'Anytime',
      notes: 'Full color change wrap. Want to see color samples in person. Satin or matte finish.',
      car_config: { car: 'BMW M6 Gran Coupe', wrap: 'Avery SW900 Satin Dark Grey', wheels: 'Vossen HF-5', tint: 'XPEL XR Plus 35% VLT', exhaust: 'Akrapovic Slip-On' },
      status: 'pending',
      created_at: '2026-04-02T10:05:00Z',
    },
  ];
}

export function getDemoReviews(shop: Shop): DemoReview[] {
  return shop.customerReviews.map((r, i) => ({
    ...r,
    reply: i === 0 ? 'Thank you so much for the kind words! It was a pleasure working on your build. We look forward to seeing you again!' : undefined,
    reply_date: i === 0 ? '2025-12-18' : undefined,
  }));
}

export function getDemoMetrics(): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  const now = new Date('2026-04-07');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseViews = isWeekend ? 18 : 12;
    const baseLeads = isWeekend ? 3 : 1;
    metrics.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: baseViews + Math.floor(Math.random() * 15),
      leads: baseLeads + Math.floor(Math.random() * 3),
    });
  }
  return metrics;
}

export function getDemoStats() {
  const metrics = getDemoMetrics();
  const totalViews = metrics.reduce((s, m) => s + m.views, 0);
  const totalLeads = metrics.reduce((s, m) => s + m.leads, 0);
  return {
    leadsThisMonth: totalLeads,
    viewsThisMonth: totalViews,
    totalQuoteRequests: totalLeads + 34,
  };
}
