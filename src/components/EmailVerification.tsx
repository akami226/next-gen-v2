import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailVerificationProps {
  email: string;
  onBackToLogin: () => void;
}

export default function EmailVerification({ email, onBackToLogin }: EmailVerificationProps) {
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendSuccess(false);
    try {
      await supabase.auth.resend({ type: 'signup', email });
      setResendSuccess(true);
      setCooldown(60);
    } catch {
      // silently fail
    } finally {
      setResending(false);
    }
  }, [cooldown, resending, email]);

  return (
    <div className="h-screen w-screen bg-[#080808] light:bg-[#f0f0f2] flex flex-col items-center justify-center font-sans antialiased relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.04)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 14 }}
            className="relative w-20 h-20 mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-[#FF4500]/[0.06]" />
            <div className="absolute inset-2 rounded-full bg-[#FF4500]/[0.1] flex items-center justify-center">
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <Mail className="w-8 h-8 text-[#FF4500]" />
              </motion.div>
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FF4500] flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 12 }}
            >
              <span className="text-[10px] font-bold text-white">1</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-white tracking-wide"
          >
            Verify Your Email
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[11px] text-white/30 mt-2 text-center leading-relaxed max-w-[280px]"
          >
            We've sent a confirmation link to your email address. Please click the link to activate your account.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm mb-5"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
              <Mail className="w-4.5 h-4.5 text-white/30" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">Sent to</p>
              <p className="text-sm text-white/70 font-medium truncate">{email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.1] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {resending
                ? 'Sending...'
                : cooldown > 0
                ? `Resend Email (${cooldown}s)`
                : 'Resend Email'}
            </button>

            {resendSuccess && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-emerald-400 text-center font-medium"
              >
                Confirmation email resent successfully
              </motion.p>
            )}
          </div>
        </motion.div>

        <motion.button
          onClick={onBackToLogin}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#FF5722] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[10px] text-white/20 text-center mt-4 leading-relaxed"
        >
          Didn't receive the email? Check your spam folder or try resending.
        </motion.p>
      </motion.div>
    </div>
  );
}
