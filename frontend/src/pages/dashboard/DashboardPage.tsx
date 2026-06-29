import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  ClipboardList,
  Eye,
  IndianRupee,
  Star,
  Wallet,
} from 'lucide-react';

import { DashboardService } from '../../services/dashboard.service';
import { WatchlistService } from '../../services/watchlist.service';
import { StockService } from '../../services/stock.service';

function formatMoney(value: string | number) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function DashboardPage() {
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolio'],
    queryFn: DashboardService.getPortfolio,
    refetchInterval: 5000,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: DashboardService.getOrders,
    refetchInterval: 5000,
  });

  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: DashboardService.getWallet,
    refetchInterval: 5000,
  });

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: WatchlistService.getWatchlist,
    refetchInterval: 5000,
  });

  const { data: stocksData } = useQuery({
    queryKey: ['stocks'],
    queryFn: StockService.getAllStocks,
    refetchInterval: 5000,
  });

  const summary = portfolioData?.data?.summary;
  const orders = ordersData?.data?.orders ?? [];
  const watchlist = watchlistData?.data?.watchlist ?? [];
  const stocks = stocksData?.data?.stocks ?? [];

  const portfolioValue = Number(summary?.current_value ?? 0);
  const invested = Number(summary?.total_invested ?? 0);
  const pnl = Number(summary?.total_pnl ?? 0);
  const pnlPercent = Number(summary?.total_pnl_percent ?? 0);
  const holdingsCount = Number(summary?.holdings_count ?? 0);
  const walletBalance = Number(walletData?.data?.wallet?.balance ?? 0);

  const topGainers = [...stocks]
    .sort((a: any, b: any) => Number(b.change_percent) - Number(a.change_percent))
    .slice(0, 4);

  const topLosers = [...stocks]
    .sort((a: any, b: any) => Number(a.change_percent) - Number(b.change_percent))
    .slice(0, 4);

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Your real-time TradeSphere command center.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/stocks"
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold transition"
          >
            Trade Now
          </Link>

          <Link
            to="/portfolio"
            className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-bold transition"
          >
            View Portfolio
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400">
            <Briefcase />
            <h3 className="font-bold">Portfolio Value</h3>
          </div>
          <p className="text-3xl font-black mt-4">{formatMoney(portfolioValue)}</p>
          <p className="text-xs text-slate-500 mt-1">
            Invested: {formatMoney(invested)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-400">
            <IndianRupee />
            <h3 className="font-bold">Total P&L</h3>
          </div>
          <p
            className={`text-3xl font-black mt-4 ${
              pnl >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatMoney(pnl)}
          </p>
          <p
            className={`text-xs mt-1 ${
              pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {pnlPercent >= 0 ? '+' : ''}
            {pnlPercent.toFixed(2)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-purple-400">
            <BarChart3 />
            <h3 className="font-bold">Holdings</h3>
          </div>
          <p className="text-3xl font-black mt-4">{holdingsCount}</p>
          <p className="text-xs text-slate-500 mt-1">Active positions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-orange-400">
            <ClipboardList />
            <h3 className="font-bold">Orders</h3>
          </div>
          <p className="text-3xl font-black mt-4">{orders.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total order history</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-cyan-400">
            <Wallet />
            <h3 className="font-bold">Wallet</h3>
          </div>
          <p className="text-3xl font-black mt-4">{formatMoney(walletBalance)}</p>
          <p className="text-xs text-slate-500 mt-1">Available cash</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Market Overview</h2>
              <p className="text-sm text-slate-500 mt-1">
                Top market movements from your simulated exchange.
              </p>
            </div>
            <Link to="/stocks" className="text-indigo-400 text-sm font-bold">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-green-400 font-bold mb-4">Top Gainers</h3>
              <div className="space-y-3">
                {topGainers.map((stock: any) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between bg-slate-950 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-black">{stock.symbol}</p>
                      <p className="text-xs text-slate-500">{stock.company_name}</p>
                    </div>
                    <p className="font-bold text-green-400">
                      +{Number(stock.change_percent).toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-red-400 font-bold mb-4">Top Losers</h3>
              <div className="space-y-3">
                {topLosers.map((stock: any) => (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between bg-slate-950 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-black">{stock.symbol}</p>
                      <p className="text-xs text-slate-500">{stock.company_name}</p>
                    </div>
                    <p className="font-bold text-red-400">
                      {Number(stock.change_percent).toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-yellow-400 fill-yellow-400" />
            <div>
              <h2 className="text-xl font-bold">Watchlist</h2>
              <p className="text-sm text-slate-500">Saved instruments</p>
            </div>
          </div>

          {watchlist.length === 0 ? (
            <div className="text-slate-500 text-sm">
              No watchlist stocks yet.
            </div>
          ) : (
            <div className="space-y-3">
              {watchlist.slice(0, 5).map((stock: any) => {
                const positive = Number(stock.change_percent) >= 0;

                return (
                  <div
                    key={stock.id}
                    className="flex items-center justify-between bg-slate-950 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-black">{stock.symbol}</p>
                      <p className="text-xs text-slate-500">{stock.company_name}</p>
                    </div>
                    <p
                      className={`font-bold ${
                        positive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {positive ? '+' : ''}
                      {Number(stock.change_percent).toFixed(2)}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            to="/stocks"
            className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 transition font-bold"
          >
            <Eye size={16} />
            Manage Watchlist
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <p className="text-sm text-slate-500 mt-1">
              Latest trades executed through your account.
            </p>
          </div>

          <Link to="/orders" className="text-indigo-400 text-sm font-bold">
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-slate-500">No orders placed yet.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition"
              >
                <div>
                  <p className="font-black text-indigo-400">{order.symbol}</p>
                  <p className="text-sm text-slate-500">{order.company_name}</p>
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
                    {new Date(order.created_at).toLocaleString('en-IN')}
                  </p>
                </div>

                <ArrowUpRight className="text-slate-600" size={18} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}