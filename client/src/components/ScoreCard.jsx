import { cn } from '@/lib/utils';

const colorMap = {
  green: { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700' },
  blue: { bg: 'bg-blue-100', bar: 'bg-blue-500', text: 'text-blue-700' },
  amber: { bg: 'bg-amber-100', bar: 'bg-amber-500', text: 'text-amber-700' },
  rose: { bg: 'bg-rose-100', bar: 'bg-rose-500', text: 'text-rose-700' },
  purple: { bg: 'bg-purple-100', bar: 'bg-purple-500', text: 'text-purple-700' },
};

function getScoreColor(value) {
  if (value >= 80) return 'green';
  if (value >= 60) return 'blue';
  if (value >= 40) return 'amber';
  return 'rose';
}

export default function ScoreCard({ label, value, maxValue = 100, color, size = 'md' }) {
  const scoreColor = color || getScoreColor(value);
  const colors = colorMap[scoreColor];
  const percentage = Math.min((value / maxValue) * 100, 100);
  const sizeClasses = size === 'sm' ? 'w-20 h-20' : 'w-28 h-28';
  const textSize = size === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full',
          colors.bg,
          sizeClasses,
        )}
      >
        <svg className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="38%"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/50"
          />
          <circle
            cx="50%"
            cy="50%"
            r="38%"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={`${percentage * 2.4} 240`}
            strokeLinecap="round"
            className={colors.bar}
          />
        </svg>
        <span className={cn('relative font-bold', textSize, colors.text)}>
          {value}
          {maxValue !== 100 && `/${maxValue}`}
        </span>
      </div>
      {label && (
        <span className="text-xs font-medium text-muted-foreground text-center">{label}</span>
      )}
    </div>
  );
}
