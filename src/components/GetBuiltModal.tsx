import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, CheckCircle, Car, Palette, Disc3, PanelTop, AudioLines, Wrench, Phone, BadgeCheck, Navigation } from 'lucide-react';
import type { Shop, BuildConfig } from '../types';
import { supabase } from '../lib/supabase';
import ZipSearchBar from './ZipSearchBar';
import { fetchZipCoords, haversineDistance } from '../lib/zipGeo';
import type { GeoCoords } from '../lib/zipGeo';

interface GetBuiltModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  buildConfig: BuildConfig;
  estimatedPrice?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

const BUILD_ITEMS = [
  { key: 'car' as const, label: 'Vehicle', icon: Car },
  { key: 'wrap' as const, label: 'Wrap', icon: Palette },
  { key: 'wheels' as const, label: 'Wheels', icon: Disc3 },
  { key: 'tint' as const, label: 'Tint', icon: PanelTop },
  { key: 'exhaust' as const, label: 'Exhaust', icon: AudioLines },
];

const INPUT_BASE = 'w-full px-4 py-2.5 rounded-xl bg-[#1a1a1a] border text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-200';
const INPUT_NORMAL = `${INPUT_BASE} border-white/[0.08] focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)]`;

type Step = 'find' | 'contact' | 'success';

export default function GetBuiltModal({ isOpen, onClose, shops, buildConfig, estimatedPrice }: GetBuiltModalProps) {
  const [step, setStep] = useState<Step>('find');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchCoords, setSearchCoords] = useState<GeoCoords | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [form, setForm] = useState<FormData>({ fullName: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const shopsWithDistance = useMemo(() => {
    if (!searchCoords) return shops.map(s => ({ ...s, distance: undefined as number | undefined }));
    return shops
      .map(s => ({ ...s, distance: haversineDistance(searchCoords, { lat: s.lat, lng: s.lng }) }))
      .filter(s => s.distance! <= 50)
      .sort((a, b) => a.distance! - b.distance!);
  }, [shops, searchCoords]);

  const displayShops = hasSearched ? shopsWithDistance : shops.map(s => ({ ...s, distance: undefined as number | undefined }));

  const handleSearch = useCallback(async (zip: string): Promise<string | null> => {
    setIsSearching(true);
    try {
      const coords = await fetchZipCoords(zip);
      setSearchCoords(coords);
      setHasSearched(true);
      return null;
    } catch {
      return 'Zip code not found';
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setSearchCoords(null);
    setHasSearched(false);
  }, []);

  const handleSelectShop = useCallback((shop: Shop) => {
    setSelectedShop(shop);
    setStep('contact');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop || !form.fullName.trim() || !form.email.trim() || !form.phone.trim()) return;

    setSubmitting(true);
    await supabase.from('quote_leads').insert({
      shop_name: selectedShop.name,
      shop_location: `${selectedShop.city}, ${selectedShop.state}`,
      customer_name: form.fullName.trim(),
      customer_email: form.email.trim(),
      customer_phone: form.phone.trim(),
      customer_city: '',
      contact_time: 'Anytime',
      notes: form.notes.trim(),
      car_config: { ...buildConfig, estimatedPrice: estimatedPrice || null },
      status: 'pending',
    });

    setSubmitting(false);
    setStep('success');
  }, [selectedShop, form, buildConfig, estimatedPrice]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep('find');
      setSelectedShop(null);
      setForm({ fullName: '', email: '', phone: '', notes: '' });
      setHasSearched(false);
      setSearchCoords(null);
    }, 300);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', zIndex: 9999 }}
          className="overflow-y-auto"
          onClick={handleClose}
        >
          <div
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--overlay-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            className="pointer-events-none"
          />

          <div className="relative flex items-start justify-center min-h-full py-8 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-[560px] bg-[#0e0e0e] light:bg-white border border-white/[0.08] light:border-gray-200 rounded-2xl shadow-2xl shadow-black/50 light:shadow-xl light:shadow-black/10"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FF4500]/10 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-[#FF4500]" />
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      {step === 'find' && 'Get This Built'}
                      {step === 'contact' && 'Send to Shop'}
                      {step === 'success' && 'Request Sent!'}
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-px bg-white/[0.06] my-5" />

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Your Build</p>
                    {estimatedPrice && (
                      <span className="text-[11px] font-bold text-[#FF4500]">{estimatedPrice}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {BUILD_ITEMS.map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center gap-3">
                        <Icon className="w-3.5 h-3.5 text-[#FF4500]/60 shrink-0" />
                        <span className="text-[10px] text-white/30 w-14 shrink-0">{label}</span>
                        <span className="text-[11px] text-white/70 font-medium truncate">{buildConfig[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {step === 'find' && (
                    <motion.div
                      key="find"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <p className="text-sm text-white/40 mb-4">Choose a shop to send your build to</p>

                      <div className="mb-4">
                        <ZipSearchBar
                          onSearch={handleSearch}
                          onClear={handleClear}
                          hasFilter={hasSearched}
                          isLoading={isSearching}
                        />
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {displayShops.length === 0 ? (
                          <div className="py-8 text-center">
                            <MapPin className="w-8 h-8 text-white/20 mx-auto mb-3" />
                            <p className="text-sm text-white/40">No shops found nearby</p>
                          </div>
                        ) : (
                          displayShops.map(shop => (
                            <button
                              key={shop.id}
                              onClick={() => handleSelectShop(shop)}
                              className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#FF4500]/30 hover:bg-[#FF4500]/[0.04] transition-all group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-white truncate">{shop.name}</h4>
                                    {shop.verified && <BadgeCheck className="w-4 h-4 text-[#FF4500] shrink-0" />}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-white/30 mb-2">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{shop.address}, {shop.city}, {shop.state}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                      <span className="text-[11px] text-white/50 font-medium">{shop.rating}</span>
                                      <span className="text-[10px] text-white/25">({shop.reviews})</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-white/25" />
                                      <span className="text-[10px] text-white/30">{shop.phone}</span>
                                    </div>
                                    {shop.distance !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <Navigation className="w-3 h-3 text-[#FF4500]/50" />
                                        <span className="text-[10px] text-[#FF4500]/60 font-medium">{shop.distance.toFixed(1)} mi</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {shop.specialties.map((s) => (
                                      <span
                                        key={s}
                                        className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.06] text-[9px] text-white/40 font-medium"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="px-3 py-1.5 rounded-lg bg-[#FF4500] text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                    Select
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {step === 'contact' && selectedShop && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={() => setStep('find')}
                          className="text-[11px] text-[#FF4500] font-medium hover:text-[#FF5722] transition-colors"
                        >
                          Change shop
                        </button>
                        <span className="text-white/20">|</span>
                        <span className="text-[11px] text-white/50 font-medium">{selectedShop.name}</span>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                            Full Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.fullName}
                            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                            className={INPUT_NORMAL}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                            Email <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            className={INPUT_NORMAL}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                            Phone <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                            className={INPUT_NORMAL}
                            placeholder="(555) 123-4567"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-white/50 uppercase tracking-wider mb-1.5">
                            Notes
                          </label>
                          <textarea
                            value={form.notes}
                            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                            rows={3}
                            className={`${INPUT_NORMAL} resize-none`}
                            placeholder="Anything else about your build..."
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Wrench className="w-4 h-4" />
                              Send Build to {selectedShop.name}
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {step === 'success' && selectedShop && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
                      >
                        <CheckCircle className="w-16 h-16 text-emerald-500 mb-5" strokeWidth={1.5} />
                      </motion.div>
                      <h3 className="text-xl font-bold text-white mb-2">Quote Request Sent!</h3>
                      <p className="text-sm text-white/60 mb-2 text-center">
                        Your build has been sent to <span className="text-[#FF4500] font-semibold">{selectedShop.name}</span>
                      </p>
                      <p className="text-sm text-white/40 mb-6 text-center">
                        They will review your build and contact you within 24 hours
                      </p>
                      <button
                        onClick={handleClose}
                        className="w-full max-w-xs py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm font-semibold hover:bg-white/[0.1] active:scale-[0.98] transition-all"
                      >
                        Back to Configurator
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
