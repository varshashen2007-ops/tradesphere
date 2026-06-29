import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { PortfolioService } from '../../services/portfolio.service';
import PortfolioAnalytics from '../../components/portfolio/PortfolioAnalytics';
import PortfolioPerformanceChart from '../../components/portfolio/PortfolioPerformanceChart';
import PortfolioRiskMeter from '../../components/portfolio/PortfolioRiskMeter';

function formatMoney(value: number) {
  return `₹${Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#14b8a6'];

export default function PortfolioPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('value');

  const { data: holdingsData, isLoading } = useQuery({
    queryKey: ['portfolio-holdings'],
    queryFn: PortfolioService.getHoldings,
    refetchInterval: 5000,
  });

  const { data: sectorsData } = useQuery({
    queryKey: ['portfolio-sectors'],
    queryFn: PortfolioService.getSectors,
    refetchInterval: 5000,
  });

  const holdings = holdingsData?.data?.holdings ?? [];
  const summary = holdingsData?.data?.summary;
  const sectors = sectorsData?.data?.sectors ?? [];

  const filteredHoldings = useMemo(() => {
    const filtered = holdings.filter((holding: any) => {
      const text = `${holding.symbol} ${holding.company_name}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });

    switch (sortBy) {
      case 'profit':
        return [...filtered].sort(
          (a: any, b: any) => Number(b.unrealized_pnl) - Number(a.unrealized_pnl)
        );

      case 'loss':
        return [...filtered].sort(
          (a: any, b: any) => Number(a.unrealized_pnl) - Number(b.unrealized_pnl)
        );

      case 'value':
        return [...filtered].sort(
          (a: any, b: any) => Number(b.current_value) - Number(a.current_value)
        );

      default:
        return filtered;
    }
  }, [holdings, search, sortBy]);

  return (
    <div>
      <h1 className="text-4xl font-black mb-2">Portfolio</h1>

      <p className="text-slate-400 mb-8">
        Track your holdings, profit/loss, risk profile, and sector allocation.
      </p>

      <PortfolioAnalytics holdings={holdings} summary={summary} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Current Value</p>
          <h2 className="text-3xl font-black mt-2">
            {formatMoney(summary?.current_value ?? 0)}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Invested</p>
          <h2 className="text-3xl font-black mt-2">
            {formatMoney(summary?.total_invested ?? 0)}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Total P&L</p>
          <h2
            className={`text-3xl font-black mt-2 ${
              (summary?.total_pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatMoney(summary?.total_pnl ?? 0)}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">Holdings</p>
          <h2 className="text-3xl font-black mt-2">
            {summary?.holdings_count ?? 0}
          </h2>
        </div>
      </div>

      <PortfolioPerformanceChart
        currentValue={summary?.current_value ?? 0}
        investedValue={summary?.total_invested ?? 0}
      />

      <PortfolioRiskMeter
        sectors={sectors}
        holdings={holdings}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold">Holdings</h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search holdings..."
                  className="w-full sm:w-56 bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500"
              >
                <option value="value">Highest Value</option>
                <option value="profit">Highest Profit</option>
                <option value="loss">Highest Loss</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-slate-400">Loading holdings...</div>
          ) : holdings.length === 0 ? (
            <div className="p-8 text-slate-400">
              No holdings yet. Buy stocks to build your portfolio.
            </div>
          ) : filteredHoldings.length === 0 ? (
            <div className="p-8 text-slate-400">
              No holdings match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-sm">
                  <tr>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Qty</th>
                    <th className="px-6 py-4 text-right">Avg Buy</th>
                    <th className="px-6 py-4 text-right">Current</th>
                    <th className="px-6 py-4 text-right">Value</th>
                    <th className="px-6 py-4 text-right">P&L</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHoldings.map((holding: any) => {
                    const pnl = Number(holding.unrealized_pnl);

                    return (
                      <tr
                        key={holding.id}
                        className="border-t border-slate-800 hover:bg-slate-800/50 transition"
                      >
                        <td className="px-6 py-4">
                          <p className="font-black text-indigo-400">
                            {holding.symbol}
                          </p>
                          <p className="text-sm text-slate-400">
                            {holding.company_name}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-right font-bold">
                          {holding.quantity}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {formatMoney(holding.average_buy_price)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          {formatMoney(holding.current_price)}
                        </td>

                        <td className="px-6 py-4 text-right font-bold">
                          {formatMoney(holding.current_value)}
                        </td>

                        <td
                          className={`px-6 py-4 text-right font-black ${
                            pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatMoney(pnl)}
                          <p className="text-xs">
                            {holding.unrealized_pnl_percent}%
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Sector Allocation</h2>

          {sectors.length === 0 ? (
            <p className="text-slate-400">No sector data yet.</p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectors}
                      dataKey="percentage"
                      nameKey="sector"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {sectors.map((_: any, index: number) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 mt-6">
                {sectors.map((sector: any, index: number) => (
                  <div
                    key={sector.sector}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-slate-300">{sector.sector}</span>
                    </div>
                    <span className="font-bold">{sector.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}