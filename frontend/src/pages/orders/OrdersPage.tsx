import type React from 'react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  Search,
  Filter,
  ArrowDownUp,
} from 'lucide-react';

import { OrdersService } from '../../services/orders.service';

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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    EXECUTED: 'bg-green-500/10 text-green-400 border-green-500/20',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const icons: Record<string, React.ReactNode> = {
    EXECUTED: <CheckCircle size={14} />,
    PENDING: <Timer size={14} />,
    CANCELLED: <XCircle size={14} />,
    FAILED: <XCircle size={14} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
        styles[status] ?? styles.PENDING
      }`}
    >
      {icons[status] ?? <Clock size={14} />}
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('LATEST');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: OrdersService.getOrders,
    refetchInterval: 5000,
  });

  const orders = data?.data?.orders ?? [];

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (search.trim()) {
      const text = search.toLowerCase();

      result = result.filter((order: any) => {
        return `${order.symbol} ${order.company_name} ${order.sector}`
          .toLowerCase()
          .includes(text);
      });
    }

    if (sideFilter !== 'ALL') {
      result = result.filter((order: any) => order.order_type === sideFilter);
    }

    if (modeFilter !== 'ALL') {
      result = result.filter((order: any) => order.order_mode === modeFilter);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((order: any) => order.status === statusFilter);
    }

    result.sort((a: any, b: any) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();

      if (sortBy === 'OLDEST') return timeA - timeB;
      if (sortBy === 'VALUE_HIGH') return Number(b.total_value) - Number(a.total_value);
      if (sortBy === 'VALUE_LOW') return Number(a.total_value) - Number(b.total_value);

      return timeB - timeA;
    });

    return result;
  }, [orders, search, sideFilter, modeFilter, statusFilter, sortBy]);

  const executedCount = orders.filter((o: any) => o.status === 'EXECUTED').length;
  const pendingCount = orders.filter((o: any) => o.status === 'PENDING').length;
  const buyCount = orders.filter((o: any) => o.order_type === 'BUY').length;
  const sellCount = orders.filter((o: any) => o.order_type === 'SELL').length;

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black mb-2">Orders</h1>
          <p className="text-slate-400">
            Track, filter, and review all market and limit orders.
          </p>
        </div>

        <div className="text-sm text-slate-500 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
          Showing <span className="text-white font-bold">{filteredOrders.length}</span> of{' '}
          <span className="text-white font-bold">{orders.length}</span> orders
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Total Orders</p>
          <h2 className="text-3xl font-black mt-2">{orders.length}</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Executed</p>
          <h2 className="text-3xl font-black mt-2 text-green-400">
            {executedCount}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Buy Orders</p>
          <h2 className="text-3xl font-black mt-2 text-green-400">
            {buyCount}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Sell Orders</p>
          <h2 className="text-3xl font-black mt-2 text-red-400">
            {sellCount}
          </h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Order History</h2>
              {pendingCount > 0 && (
                <p className="text-sm text-yellow-400 mt-1">
                  {pendingCount} pending limit order{pendingCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search symbol/company..."
                  className="w-full lg:w-64 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={sideFilter}
                onChange={(e) => setSideFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Sides</option>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>

              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Modes</option>
                <option value="MARKET">MARKET</option>
                <option value="LIMIT">LIMIT</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="EXECUTED">EXECUTED</option>
                <option value="PENDING">PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="FAILED">FAILED</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                <option value="LATEST">Latest First</option>
                <option value="OLDEST">Oldest First</option>
                <option value="VALUE_HIGH">Highest Value</option>
                <option value="VALUE_LOW">Lowest Value</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
            <Filter size={14} />
            <span>Filters update instantly on the client side.</span>
            <ArrowDownUp size={14} />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-slate-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-slate-400">
            No orders yet. Place a buy or sell order to get started.
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-slate-400">
            No orders match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Executed</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-black text-indigo-400">
                        {order.symbol}
                      </p>
                      <p className="text-sm text-slate-400">
                        {order.company_name}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.order_type === 'BUY'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {order.order_type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {order.order_mode}
                    </td>

                    <td className="px-6 py-4 text-right font-bold">
                      {order.quantity}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatMoney(order.price)}
                    </td>

                    <td className="px-6 py-4 text-right font-bold">
                      {formatMoney(order.total_value)}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(order.executed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}