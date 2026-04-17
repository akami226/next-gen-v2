import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { useSEO, SEO_CONFIGS } from '../hooks/useSEO';
import EmailVerification from '../components/EmailVerification';

interface AuthPageProps {
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onBack: () => void;
  initialMode?: 'login' | 'signup';
}

const INPUT_BASE = 'w-full pl-11 pr-4 py-3.5 min-h-[44px] rounded-xl bg-[#1a1a1a] border text-sm text-white placeholder-white/20 focus:outline-none transition-all duration-200';
const INPUT_NORMAL = `${INPUT_BASE} border-white/[0.08] focus:border-[#FF4500]/50 focus:shadow-[0_0_12px_rgba(255,69,0,0.1)]`;
const INPUT_ERROR = `${INPUT_BASE} border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_12px_rgba(239,68,68,0.1)]`;

export default function AuthPage({ onSignUp, onSignIn, onResetPassword, onBack, initialMode = 'login' }: AuthPageProps) {
  useSEO(SEO_CONFIGS.auth);
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetSent, setResetSent] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const submitting = useRef(false);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (mode === 'signup' && !name.trim()) errs.name = 'Name is required';
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email';
    }
    if (mode !== 'forgot') {
      if (!password) {
        errs.password = 'Password is required';
      } else if (password.length < 8) {
        errs.password = 'Password must be at least 8 characters';
      }
      if (mode === 'signup') {
        if (!confirmPassword) {
          errs.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
          errs.confirmPassword = 'Passwords do not match';
        }
      }
    }
    return errs;
  }, [mode, name, email, password, confirmPassword]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      if (mode === 'forgot') {
        await onResetPassword(email.trim());
        setResetSent(true);
      } else if (mode === 'signup') {
        await onSignUp(name.trim(), email.trim(), password);
        setShowEmailVerification(true);
        return;
      } else {
        await onSignIn(email.trim(), password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }, [mode, name, email, password, validate, onSignUp, onSignIn, onResetPassword]);

  const switchMode = useCallback((newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    setError('');
    setFieldErrors({});
    setResetSent(false);
    setConfirmPassword('');
    setShowConfirmPassword(false);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  if (showEmailVerification) {
    return (
      <EmailVerification
        email={email}
        onBackToLogin={() => {
          setShowEmailVerification(false);
          switchMode('login');
        }}
      />
    );
  }

  const title = mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password';
  const subtitle = mode === 'login'
    ? 'Sign in to access your builds and dashboard'
    : mode === 'signup'
    ? 'Join to save and share your builds'
    : 'Enter your email to receive reset instructions';

  return (
    <div className="h-screen w-screen bg-[#080808] light:bg-[#f0f0f2] flex flex-col items-center justify-center font-sans antialiased relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.04)_0%,transparent_70%)] light:bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.06)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FF4500]/20 to-transparent" />

      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs font-medium">Back</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center mb-5">
            <Car className="w-7 h-7 text-[#FF4500]" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">{title}</h1>
          <p className="text-[11px] text-white/30 mt-1">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {mode === 'forgot' ? (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {resetSent ? (
                    <div className="py-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6 text-emerald-400" />
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">Check your email</p>
                      <p className="text-[11px] text-white/30 leading-relaxed">
                        Password reset instructions have been sent to <span className="text-white/50 font-medium">{email}</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                          placeholder="Email address"
                          className={fieldErrors.email ? INPUT_ERROR : INPUT_NORMAL}
                        />
                      </div>
                      {fieldErrors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.email}</p>}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {mode === 'signup' && (
                    <div>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => { setName(e.target.value); clearFieldError('name'); }}
                          placeholder="Full name"
                          className={fieldErrors.name ? INPUT_ERROR : INPUT_NORMAL}
                        />
                      </div>
                      {fieldErrors.name && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.name}</p>}
                    </div>
                  )}

                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
                        placeholder="Email address"
                        className={fieldErrors.email ? INPUT_ERROR : INPUT_NORMAL}
                      />
                    </div>
                    {fieldErrors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.email}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                        placeholder="Password"
                        className={`${fieldErrors.password ? INPUT_ERROR : INPUT_NORMAL} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.password}</p>
                    ) : mode === 'signup' ? (
                      <p className="text-[10px] text-white/25 light:text-black/30 mt-1 ml-1">Password must be at least 8 characters</p>
                    ) : null}
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                          placeholder="Confirm password"
                          className={`${fieldErrors.confirmPassword ? INPUT_ERROR : INPUT_NORMAL} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <p className="text-[10px] text-red-400 mt-1 ml-1">{fieldErrors.confirmPassword}</p>}
                    </div>
                  )}

                  {mode === 'login' && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.06] accent-[#FF4500]"
                        />
                        <span className="text-[10px] text-white/30">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[10px] text-[#FF4500]/70 font-medium hover:text-[#FF4500] transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/20">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-400 font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!(mode === 'forgot' && resetSent) && (
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3.5 mt-5 rounded-xl bg-[#FF4500] text-white text-sm font-bold uppercase tracking-wider active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#FF4500]/20 flex items-center justify-center gap-2 hover:bg-[#FF5722] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div className="text-center mt-5 space-y-2">
          {mode === 'forgot' ? (
            <p className="text-[11px] text-white/30">
              Remember your password?{' '}
              <button onClick={() => switchMode('login')} className="text-[#FF4500] font-semibold hover:text-[#FF5722] transition-colors">
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-[11px] text-white/30">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-[#FF4500] font-semibold hover:text-[#FF5722] transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
