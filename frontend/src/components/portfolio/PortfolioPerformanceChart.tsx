import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Props {
  currentValue: number;
  investedValue: number;
}

export default function PortfolioPerformanceChart({
  currentValue,
  investedValue,
}: Props) {
  const difference = currentValue - investedValue;

  const data = [
    { day: 'Mon', value: investedValue * 0.992 },
    { day: 'Tue', value: investedValue * 0.998 },
    { day: 'Wed', value: investedValue * 0.995 },
    { day: 'Thu', value: investedValue * 1.002 },
    { day: 'Fri', value: investedValue * 1.006 },
    { day: 'Sat', value: investedValue * 1.004 },
    { day: 'Today', value: currentValue },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">
            Portfolio Performance
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Simulated 7-day portfolio movement
          </p>
        </div>

        <div
          className={`text-right ${
            difference >= 0
              ? 'text-green-400'
              : 'text-red-400'
          }`}
        >
          <p className="text-xs uppercase tracking-wider">
            Total Return
          </p>

          <p className="text-xl font-black">
            {difference >= 0 ? '+' : ''}
            ₹{difference.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="portfolioGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#6366f1"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="#6366f1"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
            />

            <XAxis
              dataKey="day"
              stroke="#94a3b8"
            />

            <YAxis
              stroke="#94a3b8"
              tickFormatter={(value) =>
                `₹${(value / 1000).toFixed(0)}k`
              }
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: any) =>
                `₹${Number(value).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}