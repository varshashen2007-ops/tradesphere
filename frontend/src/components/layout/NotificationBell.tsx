import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNotificationStore } from '../../store/notification.store';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, markAsRead, clearAll } = useNotificationStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-11 h-11 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-xs font-black flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-black">Notifications</h3>
              <p className="text-xs text-slate-500">
                Trading updates and account alerts
              </p>
            </div>

            <button
              onClick={clearAll}
              className="text-slate-500 hover:text-red-400"
              title="Clear all"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">
              No notifications yet.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/60 transition ${
                    !n.read ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{n.title}</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">
                        {new Date(n.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-800">
              <button
                onClick={() => notifications.forEach((n) => markAsRead(n.id))}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}