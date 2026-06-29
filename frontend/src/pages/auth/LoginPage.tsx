import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

const LoginPage = () => {
  const [email, setEmail] = useState('rahul@example.com');
  const [password, setPassword] = useState('Test@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await authApi.login({ email, password });
      const { user, token, wallet } = res.data.data;

      setAuth(user, token, wallet);
      toast.success(`Welcome back, ${user.full_name || user.username || 'Trader'}`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential?: string) {
    if (!credential) {
      toast.error('Google login failed');
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.googleLogin({ credential });
      const { user, token, wallet } = res.data.data;

      setAuth(user, token, wallet);
      toast.success(`Welcome, ${user.full_name || user.username || 'Trader'}`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden">
      <div className="hidden lg:flex flex-1 relative items-center justify-center px-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-emerald-500/10" />
        <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl top-20 left-20" />
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl bottom-20 right-20" />

        <div className="relative max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-black">TradeSphere</h1>
          </div>

          <h2 className="text-5xl font-black leading-tight mb-6">
            Trade smarter with a real-time virtual market.
          </h2>

          <p className="text-slate-400 text-lg leading-8">
            Practice buying, selling, portfolio tracking, limit orders,
            wallet management, and live simulated market movement in one
            professional trading platform.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <p className="text-3xl font-black text-emerald-400">₹10L</p>
              <p className="text-slate-400 text-sm mt-1">Virtual Capital</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <p className="text-3xl font-black text-indigo-400">Live</p>
              <p className="text-slate-400 text-sm mt-1">WebSocket Prices</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <p className="text-3xl font-black text-purple-400">Pro</p>
              <p className="text-slate-400 text-sm mt-1">Order Engine</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[480px] flex items-center justify-center px-6 bg-slate-950/80 border-l border-slate-800">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black">TradeSphere</h1>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="mb-7">
              <h2 className="text-3xl font-black">Welcome back</h2>
              <p className="text-slate-400 mt-2">
                Sign in to continue trading.
              </p>
            </div>

            <div className="mb-5 flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) =>
                  handleGoogleLogin(credentialResponse.credential)
                }
                onError={() => toast.error('Google login failed')}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="pill"
              />
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs text-slate-500">OR</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
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
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              New to TradeSphere?{' '}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Create account
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            Demo login: rahul@example.com / Test@1234
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;