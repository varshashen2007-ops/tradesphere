import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Wallet,
  Home,
  ShieldCheck,
} from 'lucide-react';

import { useSocket } from '../../hooks/useSockets';
import { useInactivityLogout } from '../../hooks/useInactivityLogout';
import { useAuthStore } from '../../store/auth.store';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';
import AssistantChatbot from '../assistant/AssistantChatbot';

const navItems = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Stocks', path: '/stocks', icon: BarChart3 },
  { label: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { label: 'Orders', path: '/orders', icon: ClipboardList },
  { label: 'Wallet', path: '/wallet', icon: Wallet },
];

export default function AppLayout() {
  useSocket();
  useInactivityLogout();

  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      <aside className="w-64 border-r border-slate-800 bg-slate-950/70 p-5">
        <div className="text-2xl font-black mb-10">TradeSphere</div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-5 mt-5 border-t border-slate-800">
              <p className="px-4 mb-2 text-xs font-black text-slate-600 uppercase tracking-widest">
                Admin
              </p>

              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <ShieldCheck size={18} />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-40 flex justify-end items-center gap-3 px-8 py-5 bg-[#020617]/80 backdrop-blur border-b border-slate-900">
          <NotificationBell />
          <ProfileMenu />
        </div>

        <div className="p-8">
          <Outlet />
        </div>

        <AssistantChatbot />
      </main>
    </div>
  );
}