import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Search } from 'lucide-react';
import { AdminService } from '../../services/admin.service';

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

export default function AdminStocksPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stocks'],
    queryFn: AdminService.getStocks,
  });

  const stocks = data?.data?.data?.stocks ?? [];

  const filteredStocks = useMemo(() => {
    const text = search.toLowerCase();

    return stocks.filter((stock: any) =>
      `${stock.symbol} ${stock.company_name} ${stock.sector}`
        .toLowerCase()
        .includes(text)
    );
  }, [stocks, search]);

  return (
    <div>
      <h1 className="text-4xl font-black mb-2">Stock Management</h1>
      <p className="text-slate-400 mb-8">
        View all listed instruments available on TradeSphere.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="text-purple-400" />
            Stocks
          </h2>

          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-slate-400">Loading stocks...</div>
        ) : filteredStocks.length === 0 ? (
          <div className="p-8 text-slate-400">No stocks found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Sector</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">High</th>
                  <th className="px-6 py-4 text-right">Low</th>
                  <th className="px-6 py-4 text-right">Volume</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredStocks.map((stock: any) => (
                  <tr
                    key={stock.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4 font-black text-indigo-400">
                      {stock.symbol}
                    </td>

                    <td className="px-6 py-4 font-bold">
                      {stock.company_name}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300">
                        {stock.sector}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-bold">
                      {formatMoney(stock.current_price)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatMoney(stock.day_high)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {formatMoney(stock.day_low)}
                    </td>

                    <td className="px-6 py-4 text-right text-slate-400">
                      {formatCompact(stock.volume)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          stock.is_active
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {stock.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
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