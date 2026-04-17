import { useState, useEffect, useCallback } from 'react';

function getRoute() {
  const hash = window.location.hash;
  // Supabase email confirmation lands with #access_token=... — redirect to /auth
  if (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery')) {
    return '/auth';
  }
  return hash.replace('#', '') || '/';
}

export function useHashRoute() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}
