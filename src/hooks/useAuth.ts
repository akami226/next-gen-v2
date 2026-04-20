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
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isShopOwner: false,
    shopOwnerData: null,
  });

  const authRequestId = useRef(0);

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
      setState({ user: null, session: null, loading: false, isShopOwner: false, shopOwnerData: null });
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
      });
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

    if (data.user) {
      const { error: profileError } = await supabase.from('user_profiles').upsert(
        {
          id: data.user.id,
          display_name: name,
          email,
        },
        { onConflict: 'id' }
      );
      if (profileError && !String(profileError.message).toLowerCase().includes('duplicate')) {
        throw profileError;
      }
    }

    // Sign out so the unverified session doesn't persist
    await supabase.auth.signOut();

    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please verify your email before signing in. Check your inbox for a confirmation link.');
      }
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Incorrect email or password. Please try again.');
      }
      throw error;
    }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

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
