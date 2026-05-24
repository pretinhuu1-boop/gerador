import { cn } from '../../../lib/cn';

export const ScoreRing = ({
  score,
  size = 56,
  thickness = 6,
}: {
  score: number;
  size?: number;
  thickness?: number;
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 75
      ? 'text-accent'
      : pct >= 50
        ? 'text-info'
        : pct >= 30
          ? 'text-warn'
          : 'text-fg-muted';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={thickness}
          fill="none"
          className="text-bg-elevated"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-700', color)}
        />
      </svg>
      <div className={cn('absolute font-bold font-mono', color)} style={{ fontSize: size * 0.32 }}>
        {Math.round(pct)}
      </div>
    </div>
  );
};
