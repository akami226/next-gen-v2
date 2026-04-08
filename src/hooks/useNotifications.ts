import { useState, useCallback, useEffect, useRef } from 'react';
import type { ShopNotification } from '../types';
import { getDemoNotifications } from '../data/demoNotifications';

export function useNotifications(isShopOwner: boolean) {
  const [notifications, setNotifications] = useState<ShopNotification[]>([]);
  const [toast, setToast] = useState<ShopNotification | null>(null);
  const initialized = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isShopOwner || initialized.current) return;
    initialized.current = true;
    setNotifications(getDemoNotifications());

    toastTimer.current = setTimeout(() => {
      const demoToast: ShopNotification = {
        id: 'toast-live',
        shop_owner_id: 'demo',
        type: 'new_lead',
        title: 'New Lead Received',
        message: 'Interested in a full wrap and tint package for my BMW M4.',
        customer_name: 'Jordan Hayes',
        metadata: { car: 'BMW M4 G82' },
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setToast(demoToast);
      setNotifications((prev) => [demoToast, ...prev]);
    }, 8000);

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [isShopOwner]);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    toast,
    markRead,
    markAllRead,
    deleteNotification,
    dismissToast,
  };
}
