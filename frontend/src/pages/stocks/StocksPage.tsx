import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  MousePointerClick,
  Star,
  ShoppingCart,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { StockService } from '../../services/stock.service';
import { WatchlistService } from '../../services/watchlist.service';
import { useMarketStore } from '../../store/market.store';
import { useNotificationStore } from '../../store/notification.store';
import TradeModal from '../../components/trading/TradeModal';
import LivePriceCell from '../../components/trading/LivePriceCell';
import WatchlistPanel from '../../components/stocks/WatchlistPanel';
import type { Stock } from '../../types/stock';

function formatMoney(value: string | number) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatCompact(value: string | number) {
  return Number(value).toLocaleString('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 2,
  });
}

export default function StocksPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const queryClient = useQueryClient();
  const livePrices = useMarketStore((state) => state.livePrices);
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  const { data, isLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: StockService.getAllStocks,
  });

  const { data: watchlistData } = useQuery({
    queryKey: ['watchlist'],
    queryFn: WatchlistService.getWatchlist,
    refetchInterval: 5000,
  });

  const stocks: Stock[] = data?.data?.stocks ?? [];
  const watchlist = watchlistData?.data?.watchlist ?? [];

  const watchlistIds = useMemo(() => {
    return new Set(watchlist.map((item: any) => String(item.id)));
  }, [watchlist]);

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const text = `${stock.symbol} ${stock.company_name} ${stock.sector}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [stocks, search]);

  async function toggleWatchlist(
    stockId: string,
    isWatchlisted: boolean,
    symbol: string,
    companyName: string
  ) {
    try {
      if (isWatchlisted) {
        await WatchlistService.removeFromWatchlist(stockId);
        toast.success('Removed from watchlist');

        addNotification({
          id: crypto.randomUUID(),
          title: 'Removed from watchlist',
          message: `${symbol} - ${companyName} was removed from your watchlist.`,
          type: 'info',
          createdAt: new Date().toISOString(),
          read: false,
        });
      } else {
        await WatchlistService.addToWatchlist(stockId);
        toast.success('Added to watchlist');

        addNotification({
          id: crypto.randomUUID(),
          title: 'Added to watchlist',
          message: `${symbol} - ${companyName} was added to your watchlist.`,
          type: 'success',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Watchlist update failed';

      toast.error(message);

      addNotification({
        id: crypto.randomUUID(),
        title: 'Watchlist update failed',
        message,
        type: 'error',
        createdAt: new Date().toISOString(),
        read: false,
      });
    }
  }

  return (
    <div>
      <WatchlistPanel />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black">Stocks</h1>
          <p className="text-slate-400 mt-2">
            Live simulated market prices powered by your WebSocket engine.
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            className="w-full rounded-2xl bg-slate-900 border border-slate-800 pl-12 pr-4 py-3 outline-none focus:border-indigo-500 transition"
            placeholder="Search stocks, sectors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-400">
            <TrendingUp />
            <h3 className="font-bold">Market Live</h3>
          </div>
          <p className="text-3xl font-black mt-4">{stocks.length}</p>
          <p className="text-slate-400 text-sm">Active listed stocks</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400">
            <Activity />
            <h3 className="font-bold">WebSocket Live</h3>
          </div>
          <p className="text-3xl font-black mt-4">
            {Object.keys(livePrices).length}
          </p>
          <p className="text-slate-400 text-sm">Stocks receiving ticks</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-400">
            <TrendingDown />
            <h3 className="font-bold">Search Results</h3>
          </div>
          <p className="text-3xl font-black mt-4">{filteredStocks.length}</p>
          <p className="text-slate-400 text-sm">Matching instruments</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-purple-400">
            <MousePointerClick />
            <h3 className="font-bold">Details + Trade</h3>
          </div>
          <p className="text-3xl font-black mt-4">OPEN</p>
          <p className="text-slate-400 text-sm">
            Click row for details, cart for trade
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Live Market Watch</h2>
            <p className="text-sm text-slate-500 mt-1">
              Click a stock row to view details. Click the cart icon to trade.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Feed Connected
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-slate-400">Loading stocks...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4">Watch</th>
                  <th className="px-6 py-4">Trade</th>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Sector</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Change</th>
                  <th className="px-6 py-4 text-right">High</th>
                  <th className="px-6 py-4 text-right">Low</th>
                  <th className="px-6 py-4 text-right">Volume</th>
                </tr>
              </thead>

              <tbody>
                {filteredStocks.map((stock) => {
                  const isWatchlisted = watchlistIds.has(String(stock.id));
                  const live = livePrices[stock.symbol];

                  const displayChangePercent =
                    live?.changePercent ?? Number(stock.change_percent);
                  const displayHigh = live?.dayHigh ?? stock.day_high;
                  const displayLow = live?.dayLow ?? stock.day_low;
                  const displayVolume = live?.volume ?? stock.volume;

                  const isPositive = Number(displayChangePercent) >= 0;

                  return (
                    <tr
                      key={stock.id}
                      onClick={() => navigate(`/stocks/${stock.symbol}`)}
                      className="border-t border-slate-800 hover:bg-slate-800/60 transition cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(
                              String(stock.id),
                              isWatchlisted,
                              stock.symbol,
                              stock.company_name
                            );
                          }}
                          className={`transition hover:scale-110 ${
                            isWatchlisted
                              ? 'text-yellow-400'
                              : 'text-slate-600 hover:text-yellow-400'
                          }`}
                          title={
                            isWatchlisted
                              ? 'Remove from watchlist'
                              : 'Add to watchlist'
                          }
                        >
                          <Star
                            size={18}
                            fill={isWatchlisted ? 'currentColor' : 'none'}
                          />
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStock(stock);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 hover:scale-110 transition"
                          title="Trade stock"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </td>

                      <td className="px-6 py-4 font-black text-indigo-400 group-hover:text-indigo-300">
                        {stock.symbol}
                      </td>

                      <td className="px-6 py-4 text-slate-200">
                        <p className="font-medium">{stock.company_name}</p>
                        <p className="text-xs text-slate-500 md:hidden">
                          {stock.sector}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300">
                          {stock.sector}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <LivePriceCell
                          symbol={stock.symbol}
                          fallbackPrice={stock.current_price}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-bold ${
                            isPositive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {Number(displayChangePercent).toFixed(2)}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right text-slate-300">
                        {formatMoney(displayHigh)}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-300">
                        {formatMoney(displayLow)}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-400">
                        {formatCompact(displayVolume)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedStock && (
        <TradeModal
          open={Boolean(selectedStock)}
          onClose={() => setSelectedStock(null)}
          stockId={String(selectedStock.id)}
          symbol={selectedStock.symbol}
          companyName={selectedStock.company_name}
          currentPrice={
            livePrices[selectedStock.symbol]?.price ??
            Number(selectedStock.current_price)
          }
        />
      )}
    </div>
  );
}