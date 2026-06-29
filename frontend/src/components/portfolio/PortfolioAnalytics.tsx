import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { formatMoney } from '../../utils/format';

interface PortfolioAnalyticsProps {
  holdings: any[];
  summary: any;
}

export default function PortfolioAnalytics({
  holdings,
  summary,
}: PortfolioAnalyticsProps) {
  const totalPnlPercent = Number(summary?.total_pnl_percent ?? 0);
  const dayPnl = Number(summary?.day_pnl ?? 0);

  const sortedByPnl = [...holdings].sort(
    (a, b) => Number(b.unrealized_pnl_percent) - Number(a.unrealized_pnl_percent)
  );

  const best = sortedByPnl[0];
  const worst = sortedByPnl[sortedByPnl.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-indigo-400">
          <Target />
          <p className="font-bold">Total Return</p>
        </div>

        <h2
          className={`text-3xl font-black mt-4 ${
            totalPnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {totalPnlPercent >= 0 ? '+' : ''}
          {totalPnlPercent.toFixed(2)}%
        </h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-purple-400">
          <Activity />
          <p className="font-bold">Day P&L</p>
        </div>

        <h2
          className={`text-3xl font-black mt-4 ${
            dayPnl >= 0 ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {formatMoney(dayPnl)}
        </h2>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-green-400">
          <TrendingUp />
          <p className="font-bold">Best Performer</p>
        </div>

        <h2 className="text-2xl font-black mt-4">
          {best?.symbol ?? '—'}
        </h2>

        <p className="text-green-400 text-sm font-bold mt-1">
          {best ? `${Number(best.unrealized_pnl_percent).toFixed(2)}%` : '—'}
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <TrendingDown />
          <p className="font-bold">Worst Performer</p>
        </div>

        <h2 className="text-2xl font-black mt-4">
          {worst?.symbol ?? '—'}
        </h2>

        <p className="text-red-400 text-sm font-bold mt-1">
          {worst ? `${Number(worst.unrealized_pnl_percent).toFixed(2)}%` : '—'}
        </p>
      </div>
    </div>
  );
}