import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ShopProfileGalleryProps {
  gallery: string[];
  shopName: string;
}

export default function ShopProfileGallery({ gallery, shopName }: ShopProfileGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === 0 ? gallery.length - 1 : lightboxIndex - 1);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === gallery.length - 1 ? 0 : lightboxIndex + 1);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-5"
      >
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Our Work</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gallery.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/[0.06] group cursor-pointer"
            >
              <img
                src={url}
                alt={`${shopName} work ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <div className="relative w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={gallery[lightboxIndex]}
                alt={`${shopName} work ${lightboxIndex + 1}`}
                className="w-full rounded-2xl object-contain max-h-[80vh]"
              />
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-xl bg-white/[0.1] border border-white/[0.15] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.15] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-center text-xs text-white/40 mt-3">
                {lightboxIndex + 1} of {gallery.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
