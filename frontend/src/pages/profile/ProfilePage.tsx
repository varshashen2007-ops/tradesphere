import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  User,
  Wallet,
  Edit3,
  Lock,
  Save,
} from 'lucide-react';

import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth.api';

function formatMoney(value: string | number) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) return 'Not available';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const { user, wallet, setUserWallet } = useAuthStore();

  const [fullName, setFullName] = useState(user?.full_name || user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const displayName = user?.full_name || user?.name || 'Trader';

  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  async function handleUpdateProfile() {
    if (!fullName.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }

    try {
      setProfileLoading(true);

      await authApi.updateProfile({
        fullName: fullName.trim(),
      });

      const fresh = await authApi.me();
      const { user: freshUser, wallet: freshWallet } = fresh.data.data;

      setUserWallet(freshUser, freshWallet);

      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Profile update failed');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      toast.error('Please enter both passwords');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    try {
      setPasswordLoading(true);

      await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');

      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-black mb-2">Profile</h1>
      <p className="text-slate-400 mb-8">
        Manage your TradeSphere account, identity, and security settings.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-8">
        <div className="h-40 bg-gradient-to-r from-indigo-600/40 via-purple-600/20 to-emerald-500/20" />

        <div className="px-8 pb-8">
          <div className="-mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-full bg-indigo-600 border-4 border-slate-900 flex items-center justify-center overflow-hidden text-4xl font-black">
                {initials}
              </div>

              <div className="pb-3">
                <h2 className="text-3xl font-black">{displayName}</h2>
                <p className="text-slate-400">@{user?.username || 'trader'}</p>
              </div>
            </div>

            <div className="pb-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-bold">
                <CheckCircle2 size={16} />
                {user?.is_verified ? 'Verified Account' : 'Demo Account'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400 mb-4">
            <User />
            <h3 className="font-bold">Personal Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-bold">{displayName}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Username</p>
              <p className="font-bold">@{user?.username || 'trader'}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <div className="flex items-center gap-2 font-bold">
                <Mail size={16} className="text-slate-500" />
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-400 mb-4">
            <Wallet />
            <h3 className="font-bold">Wallet Summary</h3>
          </div>

          <div>
            <p className="text-sm text-slate-500">Available Balance</p>
            <p className="text-3xl font-black mt-2">
              {formatMoney(wallet?.balance ?? 0)}
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm text-slate-500">Total Deposited</p>
            <p className="font-bold">
              {formatMoney(wallet?.total_deposited ?? 0)}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-purple-400 mb-4">
            <ShieldCheck />
            <h3 className="font-bold">Account Security</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Verification</p>
              <p className="font-bold text-green-400">
                {user?.is_verified ? 'Verified' : 'Not Verified'}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Authentication</p>
              <p className="font-bold">Password / Google OAuth</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Member Since</p>
              <div className="flex items-center gap-2 font-bold">
                <CalendarDays size={16} className="text-slate-500" />
                {formatDate(user?.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400 mb-6">
            <Edit3 />
            <div>
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <p className="text-sm text-slate-500">
                Update the name shown across TradeSphere.
              </p>
            </div>
          </div>

          <label className="text-sm font-semibold text-slate-300">
            Full Name
          </label>

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
            placeholder="Enter full name"
          />

          <button
            onClick={handleUpdateProfile}
            disabled={profileLoading}
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 font-bold transition"
          >
            <Save size={18} />
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-400 mb-6">
            <Lock />
            <div>
              <h2 className="text-xl font-bold">Change Password</h2>
              <p className="text-sm text-slate-500">
                Update your password for email-based login.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
              placeholder="Current password"
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
              placeholder="New password"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-60 font-bold transition"
          >
            <Lock size={18} />
            {passwordLoading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
}