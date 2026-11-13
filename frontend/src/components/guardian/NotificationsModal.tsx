import React from 'react';
import { Bell, CheckCheck, X, AlertTriangle, Pill, Calendar, ShieldAlert, Radio } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  isDark?: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  isDark = false
}) => {
  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication_due':
      case 'medication_missed':
      case 'refill':
        return <Pill className="w-4 h-4 text-indigo-500" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-sky-500" />;
      case 'sos':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'safe_zone':
        return <Radio className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className={`flex items-center justify-between pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-[#5E58E7]/20 text-indigo-400' : 'bg-indigo-50 text-[#5E58E7]'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Care Notifications</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{unreadCount} unread caregiver alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border-slate-700'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-[#5E58E7] border-indigo-100'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition-all ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className={`text-center py-12 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No notifications on record.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && onMarkRead(notif.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  !notif.is_read
                    ? isDark
                      ? 'bg-slate-800/90 border-slate-700 shadow-sm'
                      : 'bg-indigo-50/50 border-indigo-100 shadow-xs'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800 opacity-70'
                    : 'bg-slate-50/60 border-slate-100 opacity-70'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isDark ? 'bg-slate-850' : 'bg-white border border-slate-200'
                  }`}>
                    {getTypeIcon(notif.notification_type)}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${
                      !notif.is_read
                        ? isDark ? 'text-white' : 'text-slate-900'
                        : isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {notif.title}
                    </p>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {notif.message}
                    </p>
                    <span className={`text-[10px] block mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                {!notif.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5E58E7] shrink-0 mt-1.5 ring-4 ring-indigo-400/20" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
