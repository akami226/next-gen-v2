import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, FileText, Star, MessageSquareQuote, Check, ChevronRight } from 'lucide-react';
import type { ShopNotification, NotificationType } from '../types';

interface NotificationBellProps {
  notifications: ShopNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onViewAll: () => void;
  onClickNotification: (notification: ShopNotification) => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  new_lead: { icon: FileText, color: 'var(--accent)', bg: 'var(--accent)' },
  new_review: { icon: Star, color: '#F59E0B', bg: '#F59E0B' },
  new_quote: { icon: MessageSquareQuote, color: '#3B82F6', bg: '#3B82F6' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onViewAll,
  onClickNotification,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const recent = notifications.slice(0, 6);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 rounded-lg bg-white/[0.04] dark:bg-white/[0.04] light:bg-black/[0.04] border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.12] flex items-center justify-center text-white/40 dark:text-white/40 light:text-gray-600 hover:text-white/70 dark:hover:text-white/70 light:hover:text-gray-900 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] light:hover:bg-black/[0.06] transition-all"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#FF4500] text-white text-[9px] font-bold flex items-center justify-center leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -10, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-[min(100vw-2rem,20rem)] sm:w-96 max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden z-[9999] solid-dropdown bg-[#1a1a1a] dark:bg-[#1a1a1a] light:bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] dark:border-white/[0.06] light:border-gray-200">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white/80 dark:text-white/80 light:text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] text-[#FF4500] font-bold" style={{ background: `rgba(var(--accent-rgb),0.12)` }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    onMarkAllRead();
                  }}
                  className="flex items-center gap-1 text-[10px] text-white/40 dark:text-white/40 light:text-gray-600 hover:text-white/70 dark:hover:text-white/70 light:hover:text-gray-900 font-medium transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {recent.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-6 h-6 text-white/10 dark:text-white/10 light:text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-white/30 dark:text-white/30 light:text-gray-500">No notifications yet</p>
                </div>
              ) : (
                recent.map((notif, i) => {
                  const config = TYPE_CONFIG[notif.type];
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={notif.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => {
                        if (!notif.is_read) onMarkRead(notif.id);
                        onClickNotification(notif);
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-white/[0.04] dark:border-white/[0.04] light:border-gray-100 hover:bg-white/[0.04] dark:hover:bg-white/[0.04] light:hover:bg-gray-50 ${!notif.is_read ? 'bg-white/[0.02] dark:bg-white/[0.02] light:bg-gray-50/80' : ''}`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: config.bg.startsWith('var(') ? 'var(--accent-bg-subtle)' : `${config.bg}15`,
                          border: `1px solid ${config.bg.startsWith('var(') ? 'var(--accent-border-subtle)' : `${config.bg}25`}`,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-white/80 dark:text-white/80 light:text-gray-900 truncate">{notif.customer_name}</span>
                          <span className="text-[9px] text-white/25 dark:text-white/25 light:text-gray-500 shrink-0">{timeAgo(notif.created_at)}</span>
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-white/50 dark:text-white/50 light:text-gray-600 mb-0.5">{notif.title}</p>
                        <p className="text-[10px] text-white/30 dark:text-white/30 light:text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => {
                  onViewAll();
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-[10px] text-[#FF4500]/70 dark:text-[#FF4500]/70 light:text-[#2563EB] font-semibold uppercase tracking-wider hover:text-[#FF4500] dark:hover:text-[#FF4500] light:hover:text-[#1d4ed8] transition-colors border-t border-white/[0.06] dark:border-white/[0.06] light:border-gray-200"
              >
                View All Notifications
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
