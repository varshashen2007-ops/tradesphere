import { useQuery } from '@tanstack/react-query';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

import { WatchlistService } from '../../services/watchlist.service';

function formatMoney(value: string | number) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function WatchlistPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: WatchlistService.getWatchlist,
    refetchInterval: 5000,
  });

  const watchlist = data?.data?.watchlist ?? [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-5">
        <Star className="text-yellow-400 fill-yellow-400" />
        <div>
          <h2 className="text-xl font-bold">My Watchlist</h2>
          <p className="text-sm text-slate-500">Your saved market instruments.</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Loading watchlist...</p>
      ) : watchlist.length === 0 ? (
        <p className="text-slate-400">No stocks added yet. Add stocks from Market Watch.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {watchlist.map((stock: any) => {
            const isPositive = Number(stock.change_percent) >= 0;

            return (
              <div
                key={stock.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-black text-indigo-400">{stock.symbol}</p>

                  {isPositive ? (
                    <TrendingUp className="text-green-400" size={18} />
                  ) : (
                    <TrendingDown className="text-red-400" size={18} />
                  )}
                </div>

                <p className="text-sm text-slate-500 mt-1">{stock.company_name}</p>

                <div className="flex items-center justify-between mt-4">
                  <p className="font-bold">{formatMoney(stock.current_price)}</p>

                  <p
                    className={`font-bold ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {Number(stock.change_percent).toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}