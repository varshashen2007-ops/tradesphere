import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  ClipboardList,
  Users,
  Wallet,
  PackageSearch,
  ArrowRight,
} from 'lucide-react';

import { AdminService } from '../../services/admin.service';

function formatMoney(value: string | number) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) return '—';

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: AdminService.getDashboard,
    refetchInterval: 10000,
  });

  const payload = data?.data?.data;
  const stats = payload?.stats;
  const recentUsers = payload?.recentUsers ?? [];
  const recentOrders = payload?.recentOrders ?? [];

  if (isLoading) {
    return <div className="text-slate-400">Loading admin dashboard...</div>;
  }

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black">Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Manage TradeSphere users, stocks, orders, and platform activity.
          </p>
        </div>

        <div className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
          ADMIN CONTROL CENTER
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400">
            <Users />
            <h3 className="font-bold">Total Users</h3>
          </div>
          <p className="text-3xl font-black mt-4">{stats?.totalUsers ?? 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-400">
            <ClipboardList />
            <h3 className="font-bold">Total Orders</h3>
          </div>
          <p className="text-3xl font-black mt-4">{stats?.totalOrders ?? 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-purple-400">
            <PackageSearch />
            <h3 className="font-bold">Stocks Listed</h3>
          </div>
          <p className="text-3xl font-black mt-4">{stats?.totalStocks ?? 0}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-cyan-400">
            <Wallet />
            <h3 className="font-bold">Wallet Balance</h3>
          </div>
          <p className="text-2xl font-black mt-4">
            {formatMoney(stats?.totalWalletBalance ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/users"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 transition group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-indigo-400">
              <Users />
              <h3 className="font-bold">Manage Users</h3>
            </div>
            <ArrowRight className="text-slate-500 group-hover:text-white" />
          </div>
          <p className="text-slate-400 text-sm mt-4">
            View users and manage admin/user roles.
          </p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 transition group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-green-400">
              <ClipboardList />
              <h3 className="font-bold">View Orders</h3>
            </div>
            <ArrowRight className="text-slate-500 group-hover:text-white" />
          </div>
          <p className="text-slate-400 text-sm mt-4">
            Monitor all trades placed by all users.
          </p>
        </Link>

        <Link
          to="/admin/stocks"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 transition group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-purple-400">
              <BarChart3 />
              <h3 className="font-bold">Manage Stocks</h3>
            </div>
            <ArrowRight className="text-slate-500 group-hover:text-white" />
          </div>
          <p className="text-slate-400 text-sm mt-4">
            View listed instruments and stock metadata.
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800">
            <h2 className="text-xl font-bold">Recent Users</h2>
          </div>

          {recentUsers.length === 0 ? (
            <div className="p-6 text-slate-500">No users found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentUsers.map((user: any) => (
                <div key={user.id} className="px-6 py-4">
                  <p className="font-black">{user.full_name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold ${
                        user.role === 'ADMIN'
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800">
            <h2 className="text-xl font-bold">Recent Orders</h2>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 text-slate-500">No orders found.</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-black text-indigo-400">
                      {order.symbol}
                    </p>
                    <p className="text-sm text-slate-400">
                      {order.full_name || order.email}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        order.order_type === 'BUY'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {order.order_type} × {order.quantity}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}