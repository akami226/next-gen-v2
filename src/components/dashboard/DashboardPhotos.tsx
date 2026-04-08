import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, X, Star, Upload, Loader2 } from 'lucide-react';
import type { Shop } from '../../types';

export default function DashboardPhotos({ shop }: { shop: Shop }) {
  const [photos, setPhotos] = useState<string[]>(shop.gallery);
  const [mainPhoto, setMainPhoto] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const handleDelete = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (mainPhoto === index) setMainPhoto(0);
    else if (mainPhoto > index) setMainPhoto((p) => p - 1);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-xl font-bold text-white">Photo Gallery</h2>
        <p className="text-sm text-white/40 mt-1">{photos.length} photos uploaded</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 mb-6 text-center transition-colors duration-200 ${
          dragActive ? 'border-[#FF4500]/50 bg-[#FF4500]/[0.03]' : 'border-white/[0.1] bg-white/[0.02]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-white/15" />
          )}
          <div>
            <p className="text-sm text-white/50 font-medium mb-1">
              {uploading ? 'Uploading...' : 'Drag and drop photos here'}
            </p>
            <p className="text-[11px] text-white/25">or</p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-5 py-2 rounded-xl bg-[#FF4500]/10 border border-[#FF4500]/20 text-xs font-semibold text-[#FF4500] hover:bg-[#FF4500]/15 transition-colors disabled:opacity-50"
          >
            Browse Files
          </button>
          <p className="text-[10px] text-white/20">JPG, PNG, WEBP up to 10MB each</p>
        </div>
      </motion.div>

      {photos.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Gallery ({photos.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-white/[0.08]">
                <img src={url} alt={`Shop photo ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setMainPhoto(i)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      mainPhoto === i
                        ? 'bg-amber-400 text-black'
                        : 'bg-black/60 backdrop-blur-sm border border-white/[0.1] text-white/60 hover:text-amber-400'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm border border-white/[0.1] flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {mainPhoto === i && (
                  <div className="absolute bottom-2 left-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/90 text-[9px] font-bold text-black uppercase tracking-wider">
                      <Camera className="w-2.5 h-2.5" />
                      Main
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
