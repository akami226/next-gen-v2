import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowLeft, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
}

export default function AdminLoginPage({ onLogin, onBack }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError('');
    try {
      await onLogin(email.trim(), password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, password, onLogin]);

  return (
    <div className="min-h-screen w-screen bg-[#080808] font-sans antialiased flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,69,0,0.04)_0%,transparent_60%)] pointer-events-none" />

      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors font-medium z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-[#FF4500]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
          <p className="text-xs text-white/30">NextGen platform administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300/80 leading-relaxed">{error}</p>
            </motion.div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 min-h-[44px] rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)] transition-all duration-200"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 min-h-[44px] rounded-xl bg-[#1a1a1a] border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)] transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full py-3.5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#E03E00] shadow-lg shadow-[#FF4500]/20 hover:shadow-[#FF4500]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-[10px] text-white/15 text-center mt-8">
          Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
}
