'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Habit } from '@/lib/types';
import { getWeeklyData } from '@/lib/utils';

interface WeeklyChartProps {
  habits: Habit[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { total: number; day: string } }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  const total = data.payload.total;
  const completed = data.value;

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
        {label}
      </p>
      <p className="text-sm text-indigo-600 dark:text-indigo-400">
        {completed} / {total} habits
      </p>
      {total > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {Math.round((completed / total) * 100)}% completion
        </p>
      )}
    </div>
  );
}

export function WeeklyChart({ habits }: WeeklyChartProps) {
  const data = getWeeklyData(habits);
  const maxValue = Math.max(...data.map((d) => d.total), 1);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          domain={[0, maxValue]}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} />
        <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => {
            const isToday = index === data.length - 1;
            const rate = entry.total > 0 ? entry.completed / entry.total : 0;
            return (
              <Cell
                key={`cell-${index}`}
                fill={
                  isToday
                    ? '#6366f1'
                    : rate >= 0.8
                    ? '#818cf8'
                    : rate >= 0.5
                    ? '#a5b4fc'
                    : '#c7d2fe'
                }
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
