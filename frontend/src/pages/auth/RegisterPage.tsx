import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Test@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName || !username || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.register({
        fullName,
        username,
        email,
        password,
      });

      const { user, token, wallet } = res.data.data;

      setAuth(user, token, wallet);

      toast.success('Account created successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister(credential?: string) {
    if (!credential) {
      toast.error('Google sign up failed');
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.googleRegister({ credential });
      const { user, token, wallet } = res.data.data;

      setAuth(user, token, wallet);

      toast.success('Google account created successfully');
      navigate('/');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          'Google sign up failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden">
      <div className="hidden lg:flex flex-1 relative items-center justify-center px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-emerald-500/10" />
        <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl top-20 left-20" />
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl bottom-20 right-20" />

        <div className="relative max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-black">TradeSphere</h1>
          </div>

          <h2 className="text-5xl font-black leading-tight mb-6">
            Start with ₹10,00,000 virtual capital.
          </h2>

          <p className="text-slate-400 text-lg leading-8">
            Create your account, build your portfolio, place market and limit
            orders, and track real-time profit and loss with a professional
            trading dashboard.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <p className="text-3xl font-black text-emerald-400">Free</p>
              <p className="text-slate-400 text-sm mt-1">Virtual Trading</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <p className="text-3xl font-black text-indigo-400">Live</p>
              <p className="text-slate-400 text-sm mt-1">Price Engine</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <p className="text-3xl font-black text-purple-400">Smart</p>
              <p className="text-slate-400 text-sm mt-1">Portfolio P&L</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[500px] flex items-center justify-center px-6 bg-slate-950/80 border-l border-slate-800">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black">TradeSphere</h1>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="mb-7">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                <UserPlus className="text-indigo-400" />
              </div>

              <h2 className="text-3xl font-black">Create account</h2>
              <p className="text-slate-400 mt-2">
                Join TradeSphere and start trading virtually.
              </p>
            </div>

            <div className="mb-5 flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) =>
                  handleGoogleRegister(credentialResponse.credential)
                }
                onError={() => toast.error('Google sign up failed')}
                theme="filled_black"
                size="large"
                text="signup_with"
                shape="pill"
              />
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs text-slate-500">OR</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-300">
                  Full name
                </label>
                <input
                  className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Varsha Shen"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300">
                  Username
                </label>
                <input
                  className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="varsha_trades"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300">
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 pr-12 text-white outline-none focus:border-indigo-500 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Test@1234"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 py-3 font-bold transition shadow-lg shadow-indigo-600/25"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;