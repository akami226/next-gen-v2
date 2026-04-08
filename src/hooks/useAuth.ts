import { useState, useEffect, useCallback } from 'react';
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

  const fetchShopOwner = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('shop_owners')
      .select('id, shop_id, shop_name, plan, plan_price, next_billing_date, logo_url, banner_url, profile_picture_url')
      .eq('user_id', userId)
      .maybeSingle();
    return data as ShopOwnerData | null;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchShopOwner(session.user.id).then((shopData) => {
          setState({
            user: session.user,
            session,
            loading: false,
            isShopOwner: !!shopData,
            shopOwnerData: shopData,
          });
        });
      } else {
        setState({ user: null, session: null, loading: false, isShopOwner: false, shopOwnerData: null });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchShopOwner(session.user.id).then((shopData) => {
          setState({
            user: session.user,
            session,
            loading: false,
            isShopOwner: !!shopData,
            shopOwnerData: shopData,
          });
        });
      } else {
        setState({ user: null, session: null, loading: false, isShopOwner: false, shopOwnerData: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchShopOwner]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        display_name: name,
        email,
      });
    }

    await supabase.auth.signOut();

    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const refreshShopOwner = useCallback(async () => {
    if (!state.user) return;
    const shopData = await fetchShopOwner(state.user.id);
    setState((prev) => ({
      ...prev,
      isShopOwner: !!shopData,
      shopOwnerData: shopData,
    }));
  }, [state.user, fetchShopOwner]);

  return { ...state, signUp, signIn, signOut, resetPassword, refreshShopOwner };
}
