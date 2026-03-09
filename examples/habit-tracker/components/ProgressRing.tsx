'use client';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = '#6366f1',
  trackColor = '#e5e7eb',
  showLabel = true,
  label,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset =
    circumference - (clampedPercentage / 100) * circumference;

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`Progress: ${clampedPercentage}%`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="dark:opacity-30"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="progress-ring-circle"
          style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold text-gray-900 dark:text-white tabular-nums"
            style={{ fontSize: size * 0.2 }}
          >
            {clampedPercentage}%
          </span>
          {label && (
            <span
              className="text-gray-500 dark:text-gray-400 text-center leading-tight"
              style={{ fontSize: size * 0.1 }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
