import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search } from 'lucide-react';
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

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: AdminService.getOrders,
  });

  const orders = data?.data?.data?.orders ?? [];

  const filteredOrders = useMemo(() => {
    const text = search.toLowerCase();

    return orders.filter((order: any) =>
      `${order.symbol} ${order.company_name} ${order.full_name} ${order.email} ${order.status}`
        .toLowerCase()
        .includes(text)
    );
  }, [orders, search]);

  return (
    <div>
      <h1 className="text-4xl font-black mb-2">All User Orders</h1>
      <p className="text-slate-400 mb-8">
        Monitor every buy and sell order placed on TradeSphere.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="text-green-400" />
            Orders
          </h2>

          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-slate-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-slate-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold">{order.full_name || 'User'}</p>
                      <p className="text-sm text-slate-500">{order.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-black text-indigo-400">
                        {order.symbol}
                      </p>
                      <p className="text-sm text-slate-500">
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
                      {formatMoney(order.total_value ?? 0)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {formatDate(order.created_at)}
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