import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Star, MessageSquareQuote, X } from 'lucide-react';
import type { ShopNotification, NotificationType } from '../types';

interface NotificationToastProps {
  notification: ShopNotification | null;
  onDismiss: () => void;
}

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  new_lead: FileText,
  new_review: Star,
  new_quote: MessageSquareQuote,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  new_lead: '#FF4500',
  new_review: '#F59E0B',
  new_quote: '#3B82F6',
};

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-[9998] pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto w-80 bg-[#111111]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${TYPE_COLOR[notification.type]}15`,
                  border: `1px solid ${TYPE_COLOR[notification.type]}25`,
                }}
              >
                {(() => {
                  const Icon = TYPE_ICON[notification.type];
                  return <Icon className="w-4 h-4" style={{ color: TYPE_COLOR[notification.type] }} />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/70 mb-0.5">{notification.title}</p>
                <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">
                  {notification.type === 'new_lead' || notification.type === 'new_quote'
                    ? `New ${notification.type === 'new_lead' ? 'lead' : 'quote request'} received from ${notification.customer_name}`
                    : `${notification.customer_name} left a ${(notification.metadata?.rating as number) || 5}-star review`}
                </p>
              </div>
              <button
                onClick={onDismiss}
                className="w-6 h-6 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/[0.06] transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-0.5 origin-left"
              style={{ backgroundColor: TYPE_COLOR[notification.type] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
