interface BadgeProps {
  children: React.ReactNode;
  tone?: 'green' | 'red' | 'yellow' | 'indigo' | 'slate';
}

const toneClasses = {
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  slate: 'bg-slate-800 text-slate-300 border-slate-700',
};

export default function Badge({
  children,
  tone = 'slate',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}