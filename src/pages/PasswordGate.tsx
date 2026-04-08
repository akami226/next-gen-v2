import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'NextGenNeel') {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }, [password, onSuccess]);

  return (
    <div className="h-screen w-screen bg-[#080808] flex flex-col items-center justify-center font-sans antialiased relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.04)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center mb-5"
          >
            <Car className="w-7 h-7 text-[#FF4500]" />
          </motion.div>
          <h1 className="text-xl font-bold text-white tracking-wide">NextGen</h1>
          <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase mt-1">3D Configurator</p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          animate={shaking ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.45 }}
        >
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">Access Required</span>
            </div>

            <div className="relative mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter password"
                autoFocus
                className={`w-full px-4 py-3.5 min-h-[44px] rounded-xl bg-[#1a1a1a] border text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-200 ${
                  error
                    ? 'border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                    : 'border-white/[0.08] focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)]'
                }`}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-400 font-medium">Incorrect password. Please try again.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full min-h-[44px] py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20 flex items-center justify-center gap-2 hover:bg-[#FF5722]"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.form>

        <p className="text-[10px] text-white/15 text-center mt-6">
          Authorized access only
        </p>
      </motion.div>
    </div>
  );
}
