import { useCountdown } from '../hooks/useCountdown';
import { Clock } from 'lucide-react';

export default function CountdownBadge({ startDate }) {
  const time = useCountdown(startDate);

  const { h = 0, m = 0, s = 0, total = 0 } = time || {};

  if (!time || total <= 0) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
      <Clock size={12} />
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
