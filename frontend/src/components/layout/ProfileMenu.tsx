import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserCircle, Wallet } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

function formatMoney(value: string | number) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { user, wallet, logout } = useAuthStore();

  function handleLogout() {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  }

  const displayName =
    user?.full_name ||
    user?.name ||
    user?.username ||
    'Trader';

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black border border-indigo-300 hover:scale-105 transition shadow-lg shadow-indigo-600/20"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-lg">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="font-black text-white truncate">
                  {displayName}
                </p>
                <p className="text-sm text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between bg-slate-950 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Wallet size={16} />
                <span className="text-sm">Wallet</span>
              </div>
              <span className="font-bold">
                {formatMoney(wallet?.balance ?? 0)}
              </span>
            </div>

            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 transition"
            >
              <UserCircle size={18} />
              View Profile
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}