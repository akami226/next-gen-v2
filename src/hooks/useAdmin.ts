import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AdminState {
  isAdmin: boolean;
  adminUser: { id: string; role: string } | null;
  user: User | null;
  loading: boolean;
}

export function useAdmin() {
  const [state, setState] = useState<AdminState>({
    isAdmin: false,
    adminUser: null,
    user: null,
    loading: true,
  });

  const checkAdmin = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('admin_users')
      .select('id, role, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdmin(session.user.id).then((adminData) => {
          setState({
            user: session.user,
            isAdmin: !!adminData,
            adminUser: adminData ? { id: adminData.id, role: adminData.role } : null,
            loading: false,
          });
        });
      } else {
        setState({ user: null, isAdmin: false, adminUser: null, loading: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAdmin(session.user.id).then((adminData) => {
          setState({
            user: session.user,
            isAdmin: !!adminData,
            adminUser: adminData ? { id: adminData.id, role: adminData.role } : null,
            loading: false,
          });
        });
      } else {
        setState({ user: null, isAdmin: false, adminUser: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const adminData = await checkAdmin(data.user.id);
    if (!adminData) {
      await supabase.auth.signOut();
      throw new Error('Access denied. This account does not have admin privileges.');
    }

    return data;
  }, [checkAdmin]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signIn, signOut };
}
