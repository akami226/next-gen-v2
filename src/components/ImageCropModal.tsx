import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Loader2 } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  aspectRatio: number;
  shape?: 'square' | 'circle' | 'banner';
  title: string;
  onCropComplete: (blob: Blob) => void;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  imageFile,
  aspectRatio,
  shape = 'square',
  title,
  onCropComplete,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState('');
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImgSrc(url);
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(false);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImgLoaded(true);
      };
      img.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleCrop = useCallback(async () => {
    if (!canvasRef.current || !imgRef.current) return;
    setProcessing(true);

    const outputW = shape === 'banner' ? 1200 : 400;
    const outputH = Math.round(outputW / aspectRatio);

    const canvas = canvasRef.current;
    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    const previewW = 320;
    const previewH = previewW / aspectRatio;
    const scaleRatio = outputW / previewW;

    const imgDisplayW = img.naturalWidth * scale * (previewW / Math.max(img.naturalWidth, img.naturalHeight * aspectRatio));
    const imgDisplayH = img.naturalHeight * scale * (previewH / Math.max(img.naturalHeight, img.naturalWidth / aspectRatio));

    const drawX = (offset.x + (previewW - imgDisplayW) / 2) * scaleRatio;
    const drawY = (offset.y + (previewH - imgDisplayH) / 2) * scaleRatio;
    const drawW = imgDisplayW * scaleRatio;
    const drawH = imgDisplayH * scaleRatio;

    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, outputW, outputH);

    if (shape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(outputW / 2, outputH / 2, outputW / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    if (shape === 'circle') {
      ctx.restore();
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
        setProcessing(false);
        onClose();
      },
      'image/webp',
      0.9
    );
  }, [scale, offset, aspectRatio, shape, onCropComplete, onClose]);

  const previewW = 320;
  const previewH = previewW / aspectRatio;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#0e0e0e] light:bg-white border border-white/[0.08] light:border-gray-200 rounded-2xl shadow-2xl light:shadow-xl light:shadow-black/10 w-full max-w-md mx-4 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4">
              <div
                className="relative mx-auto overflow-hidden bg-[#1a1a1a] border border-white/[0.08]"
                style={{
                  width: previewW,
                  height: previewH,
                  borderRadius: shape === 'circle' ? '50%' : shape === 'banner' ? 16 : 20,
                  cursor: dragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                {imgLoaded && imgSrc && (
                  <img
                    src={imgSrc}
                    alt="crop preview"
                    className="absolute select-none pointer-events-none"
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                      transformOrigin: 'center center',
                      maxWidth: 'none',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    draggable={false}
                  />
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                  className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="flex-1 max-w-[180px]">
                  <input
                    type="range"
                    min={50}
                    max={300}
                    value={scale * 100}
                    onChange={(e) => setScale(Number(e.target.value) / 100)}
                    className="w-full accent-[#FF4500] h-1"
                  />
                </div>
                <button
                  onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                  className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setScale(1);
                    setOffset({ x: 0, y: 0 });
                  }}
                  className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-white/20 text-center mt-2">Drag to reposition, scroll to zoom</p>
            </div>

            <div className="flex gap-3 p-4 border-t border-white/[0.06]">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-semibold hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                disabled={processing || !imgLoaded}
                className="flex-1 py-2.5 rounded-xl bg-[#FF4500] text-white text-xs font-bold hover:bg-[#FF5722] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#FF4500]/20"
              >
                {processing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {processing ? 'Processing...' : 'Apply'}
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
