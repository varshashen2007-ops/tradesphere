import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  tone?: 'default' | 'green' | 'red' | 'indigo';
}

const toneClasses = {
  default: 'text-white',
  green: 'text-green-400',
  red: 'text-red-400',
  indigo: 'text-indigo-400',
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = 'default',
}: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition">
      <div className="flex items-center justify-between gap-4">
        <p className="text-slate-400">{title}</p>
        {icon && <div className={toneClasses[tone]}>{icon}</div>}
      </div>

      <h2 className={`text-3xl font-black mt-3 ${toneClasses[tone]}`}>
        {value}
      </h2>

      {subtitle && (
        <p className="text-sm text-slate-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}