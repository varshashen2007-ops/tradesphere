import { ShieldAlert, PieChart, AlertTriangle } from 'lucide-react';

interface Props {
  sectors: any[];
  holdings: any[];
}

export default function PortfolioRiskMeter({ sectors, holdings }: Props) {
  const highestSector = sectors.reduce(
    (max, sector) =>
      Number(sector.percentage) > Number(max?.percentage ?? 0) ? sector : max,
    null
  );

  const concentration = Number(highestSector?.percentage ?? 0);

  const diversificationScore =
    holdings.length >= 5 && concentration < 50
      ? 85
      : holdings.length >= 3 && concentration < 70
      ? 65
      : 40;

  const risk =
    diversificationScore >= 80
      ? 'Low'
      : diversificationScore >= 60
      ? 'Moderate'
      : 'High';

  const riskColor =
    risk === 'Low'
      ? 'text-green-400'
      : risk === 'Moderate'
      ? 'text-yellow-400'
      : 'text-red-400';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-indigo-400">
          <PieChart />
          <p className="font-bold">Diversification Score</p>
        </div>

        <h2 className="text-4xl font-black mt-4">
          {diversificationScore}/100
        </h2>

        <div className="h-2 bg-slate-800 rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${diversificationScore}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-orange-400">
          <ShieldAlert />
          <p className="font-bold">Portfolio Risk</p>
        </div>

        <h2 className={`text-4xl font-black mt-4 ${riskColor}`}>
          {risk}
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Based on sector concentration and number of holdings.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle />
          <p className="font-bold">Largest Exposure</p>
        </div>

        <h2 className="text-2xl font-black mt-4">
          {highestSector?.sector ?? '—'}
        </h2>

        <p className="text-red-400 font-bold mt-1">
          {concentration.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}