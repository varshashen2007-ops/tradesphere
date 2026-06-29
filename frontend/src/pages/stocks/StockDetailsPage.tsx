import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Activity,
  BarChart3,
  Building2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import { StockService } from '../../services/stock.service';

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

export default function StockDetailsPage() {
  const { symbol } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['stock-details', symbol],
    queryFn: () => StockService.getStockBySymbol(symbol || ''),
    enabled: Boolean(symbol),
    refetchInterval: 5000,
  });

  const stock = data?.data?.stock;

  if (isLoading) {
    return <div className="text-slate-400">Loading stock details...</div>;
  }

  if (!stock) {
    return <div className="text-slate-400">Stock not found.</div>;
  }

  const changePercent = Number(stock.change_percent);
  const isPositive = changePercent >= 0;

  return (
    <div>
      <Link
        to="/stocks"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft size={18} />
        Back to Stocks
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center">
                <Building2 />
              </div>

              <div>
                <h1 className="text-4xl font-black">{stock.symbol}</h1>
                <p className="text-slate-400">{stock.company_name}</p>
              </div>
            </div>

            <span className="inline-flex px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm">
              {stock.sector}
            </span>
          </div>

          <div className="text-left xl:text-right">
            <p className="text-slate-400">Current Price</p>
            <h2 className="text-5xl font-black mt-2">
              {formatMoney(stock.current_price)}
            </h2>

            <p
              className={`font-bold mt-3 ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {Number(stock.change).toFixed(2)} ({isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-green-400">
            <TrendingUp />
            <h3 className="font-bold">Day High</h3>
          </div>
          <p className="text-3xl font-black mt-4">
            {formatMoney(stock.day_high)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-400">
            <TrendingDown />
            <h3 className="font-bold">Day Low</h3>
          </div>
          <p className="text-3xl font-black mt-4">
            {formatMoney(stock.day_low)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-indigo-400">
            <Activity />
            <h3 className="font-bold">Volume</h3>
          </div>
          <p className="text-3xl font-black mt-4">
            {formatCompact(stock.volume)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-purple-400">
            <BarChart3 />
            <h3 className="font-bold">Market Cap</h3>
          </div>
          <p className="text-3xl font-black mt-4">
            {stock.market_cap ? formatCompact(stock.market_cap) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-2xl font-black mb-4">About {stock.symbol}</h2>
        <p className="text-slate-400 leading-8">
          {stock.company_name} is listed in the {stock.sector} sector on
          TradeSphere. This page displays simulated live market movement,
          current trading price, day range, volume, and key stock information.
        </p>
      </div>
    </div>
  );
}