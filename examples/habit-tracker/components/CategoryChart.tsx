'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Habit } from '@/lib/types';
import { getCategoryData, CATEGORY_CONFIG } from '@/lib/utils';
import { Category } from '@/lib/types';

interface CategoryChartProps {
  habits: Habit[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; payload: { name: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const config = CATEGORY_CONFIG[item.payload.name as Category];

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config?.color }}
        />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {config?.label ?? item.name}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
        {item.value} habit{item.value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function CategoryChart({ habits }: CategoryChartProps) {
  const data = getCategoryData(habits);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
        No habit data yet
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={CustomLabel as any}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.config?.color ?? '#6366f1'}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {data.map((entry) => {
          const config = CATEGORY_CONFIG[entry.name as Category];
          return (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: config?.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {config?.label ?? entry.name} ({entry.value})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
