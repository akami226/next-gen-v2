import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, FileText, Star, MessageSquareQuote, Check, Trash2, CheckCheck } from 'lucide-react';
import type { ShopNotification, NotificationType } from '../../types';

interface DashboardNotificationsProps {
  notifications: ShopNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onClickNotification: (notification: ShopNotification) => void;
}

type FilterType = 'all' | 'new_lead' | 'new_review' | 'new_quote';

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new_lead', label: 'Leads' },
  { id: 'new_review', label: 'Reviews' },
  { id: 'new_quote', label: 'Quote Requests' },
];

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; label: string }> = {
  new_lead: { icon: FileText, color: '#FF4500', label: 'New Lead' },
  new_review: { icon: Star, color: '#F59E0B', label: 'New Review' },
  new_quote: { icon: MessageSquareQuote, color: '#3B82F6', label: 'Quote Request' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function DashboardNotifications({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClickNotification,
}: DashboardNotificationsProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Notifications</h2>
          <p className="text-sm text-white/40 mt-1">
            {unreadCount > 0 ? (
              <>You have <span className="text-[#FF4500] font-medium">{unreadCount} unread</span> notification{unreadCount !== 1 ? 's' : ''}</>
            ) : (
              'All caught up!'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white/50 hover:text-white/80 hover:bg-white/[0.07] transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 mb-6 overflow-x-auto pb-1"
      >
        {FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.id;
          const count = opt.id === 'all'
            ? notifications.length
            : notifications.filter((n) => n.type === opt.id).length;
          return (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'bg-[#FF4500]/10 text-[#FF4500] border border-[#FF4500]/15'
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
              }`}
            >
              {opt.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                active ? 'bg-[#FF4500]/20 text-[#FF4500]' : 'bg-white/[0.06] text-white/25'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Bell className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/25">No notifications in this category</p>
          </motion.div>
        ) : (
          filtered.map((notif, i) => {
            const config = TYPE_CONFIG[notif.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                className={`group relative rounded-xl border transition-all duration-200 ${
                  notif.is_read
                    ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                    : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06]'
                }`}
              >
                <button
                  onClick={() => {
                    if (!notif.is_read) onMarkRead(notif.id);
                    onClickNotification(notif);
                  }}
                  className="w-full text-left p-4 flex items-start gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${config.color}12`,
                      border: `1px solid ${config.color}20`,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white/80">{notif.customer_name}</span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#FF4500] shrink-0" />
                      )}
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold"
                        style={{
                          backgroundColor: `${config.color}12`,
                          color: config.color,
                        }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 font-medium mb-1">{notif.title}</p>
                    <p className="text-xs text-white/30 leading-relaxed">{notif.message}</p>
                    {notif.metadata && notif.type !== 'new_review' && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {typeof notif.metadata.car === 'string' && notif.metadata.car && (
                          <span className="text-[9px] px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/30 font-medium">
                            {notif.metadata.car}
                          </span>
                        )}
                        {typeof notif.metadata.service === 'string' && notif.metadata.service && (
                          <span className="text-[9px] px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-white/30 font-medium">
                            {notif.metadata.service}
                          </span>
                        )}
                      </div>
                    )}
                    {notif.type === 'new_review' && typeof notif.metadata?.rating === 'number' && (
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star
                            key={si}
                            className={`w-3 h-3 ${
                              si < (notif.metadata.rating as number) ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-white/15 mt-2">
                      {formatDate(notif.created_at)} at {formatTime(notif.created_at)}
                    </p>
                  </div>
                </button>

                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkRead(notif.id);
                      }}
                      className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.1] transition-all"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notif.id);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-red-400/70 hover:bg-red-500/[0.06] transition-all"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
