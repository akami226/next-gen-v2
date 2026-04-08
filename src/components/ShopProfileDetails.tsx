import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import type { Shop } from '../types';

interface ShopProfileDetailsProps {
  shop: Shop;
}

export default function ShopProfileDetails({ shop }: ShopProfileDetailsProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = shop.hours.find(h => h.day === today);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5"
      >
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Contact</h3>
        <div className="space-y-3.5">
          <a href={`tel:${shop.phone}`} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-[#FF4500]" />
            </div>
            <div>
              <p className="text-xs text-white/30">Phone</p>
              <p className="text-sm text-white/80 font-medium group-hover:text-[#FF4500] transition-colors">{shop.phone}</p>
            </div>
          </a>
          <a href={`mailto:${shop.email}`} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-[#FF4500]" />
            </div>
            <div>
              <p className="text-xs text-white/30">Email</p>
              <p className="text-sm text-white/80 font-medium group-hover:text-[#FF4500] transition-colors">{shop.email}</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF4500]/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#FF4500]" />
            </div>
            <div>
              <p className="text-xs text-white/30">Address</p>
              <p className="text-sm text-white/80 font-medium">{shop.address}, {shop.city}, {shop.state} {shop.zip}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Hours</h3>
          {todayHours && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              todayHours.closed
                ? 'bg-red-500/10 text-red-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {todayHours.closed ? 'Closed Today' : `Open until ${todayHours.close}`}
            </span>
          )}
        </div>
        <div className="space-y-2">
          {shop.hours.map((h) => (
            <div
              key={h.day}
              className={`flex items-center justify-between py-1.5 ${
                h.day === today ? 'text-white' : 'text-white/40'
              }`}
            >
              <div className="flex items-center gap-2">
                {h.day === today && <Clock className="w-3 h-3 text-[#FF4500]" />}
                <span className={`text-xs font-medium ${h.day === today ? 'text-white' : ''}`}>
                  {h.day}
                </span>
              </div>
              <span className={`text-xs ${h.closed ? 'text-white/25' : ''}`}>
                {h.closed ? 'Closed' : `${h.open} - ${h.close}`}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
