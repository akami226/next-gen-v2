import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface ShopOwnerData {
  id: string;
  shop_id: string;
  shop_name: string;
  plan: string;
  plan_price: number;
  next_billing_date: string | null;
  logo_url: string | null;
  banner_url: string | null;
  profile_picture_url: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isShopOwner: boolean;
  shopOwnerData: ShopOwnerData | null;
  sessionWarning: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isShopOwner: false,
    shopOwnerData: null,
    sessionWarning: false,
  });

  const authRequestId = useRef(0);
  const sessionWarningTimer = useRef<NodeJS.Timeout>();

  const clearSessionWarning = useCallback(() => {
    if (sessionWarningTimer.current) {
      clearTimeout(sessionWarningTimer.current);
      sessionWarningTimer.current = undefined;
    }
    setState(prev => ({ ...prev, sessionWarning: false }));
  }, []);

  const fetchShopOwner = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('shop_owners')
      .select('id, shop_id, shop_name, plan, plan_price, next_billing_date, logo_url, banner_url, profile_picture_url')
      .eq('user_id', userId)
      .maybeSingle();
    return data as ShopOwnerData | null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const applySignedOut = () => {
      if (cancelled) return;
      clearSessionWarning();
      setState({ user: null, session: null, loading: false, isShopOwner: false, shopOwnerData: null, sessionWarning: false });
    };

    const applySignedIn = async (session: Session, requestId: number) => {
      const shopData = await fetchShopOwner(session.user.id);
      if (cancelled || requestId !== authRequestId.current) return;
      setState({
        user: session.user,
        session,
        loading: false,
        isShopOwner: !!shopData,
        shopOwnerData: shopData,
        sessionWarning: false,
      });

      // Set up session expiry warning (5 minutes before expiry)
      if (session.expires_at) {
        const expiryTime = session.expires_at * 1000;
        const warningTime = expiryTime - (5 * 60 * 1000); // 5 minutes before
        const now = Date.now();

        if (warningTime > now) {
          sessionWarningTimer.current = setTimeout(() => {
            setState(prev => ({ ...prev, sessionWarning: true }));
          }, warningTime - now);
        }
      }
    };

    const handleSession = (session: Session | null) => {
      if (cancelled) return;
      const requestId = ++authRequestId.current;
      if (!session?.user) {
        applySignedOut();
        return;
      }
      void applySignedIn(session, requestId);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchShopOwner]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const redirectTo = `${window.location.origin}${window.location.pathname}#/auth`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;

    // Profile creation is best-effort — no active session exists while email is
    // unconfirmed so RLS may reject the insert. The row is created/updated on
    // first successful sign-in via the onAuthStateChange handler instead.
    if (data.user) {
      await supabase.from('user_profiles').upsert(
        { id: data.user.id, display_name: name, email },
        { onConflict: 'id' }
      ).then(() => null, () => null);
    }

    // Sign out so the unverified session doesn't persist
    await supabase.auth.signOut().catch(() => null);

    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Generic error messages to prevent account enumeration
      const genericError = 'Invalid email or password. Please check your credentials and try again.';
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please verify your email before signing in. Check your inbox for a confirmation link.');
      }
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error(genericError);
      }
      if (error.message.toLowerCase().includes('user not found')) {
        throw new Error(genericError);
      }
      throw new Error(genericError);
    }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    clearSessionWarning();
    await supabase.auth.signOut();
  }, [clearSessionWarning]);

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}${window.location.pathname}#/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }, []);

  const refreshShopOwner = useCallback(async (userId?: string) => {
    const id = userId ?? state.user?.id;
    if (!id) return;
    const shopData = await fetchShopOwner(id);
    setState((prev) => ({
      ...prev,
      isShopOwner: !!shopData,
      shopOwnerData: shopData,
    }));
  }, [state.user, fetchShopOwner]);

  return { ...state, signUp, signIn, signOut, resetPassword, refreshShopOwner };
}
