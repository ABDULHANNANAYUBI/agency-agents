'use client';

import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  addDays,
  subDays,
  parseISO,
  isFuture,
  isToday,
} from 'date-fns';
import { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CalendarHeatmapProps {
  habit: Habit;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getIntensity(completed: boolean, isFutureDate: boolean): string {
  if (isFutureDate) return 'opacity-20';
  if (completed) return '';
  return '';
}

function getCellColor(
  completed: boolean,
  isFutureDate: boolean,
  habitColor: string,
  isTodayDate: boolean
): React.CSSProperties {
  if (isFutureDate) {
    return { backgroundColor: '#e5e7eb' };
  }
  if (completed) {
    return { backgroundColor: habitColor };
  }
  if (isTodayDate) {
    return { backgroundColor: '#c7d2fe', border: '2px solid #6366f1' };
  }
  return {};
}

interface TooltipState {
  date: string;
  completed: boolean;
  x: number;
  y: number;
  visible: boolean;
}

export function CalendarHeatmap({ habit }: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    date: '',
    completed: false,
    x: 0,
    y: 0,
    visible: false,
  });

  const { weeks, monthMarkers } = useMemo(() => {
    const today = new Date();
    const endDate = endOfWeek(today, { weekStartsOn: 1 });
    const startDate = startOfWeek(subDays(today, 52 * 7 - 1), { weekStartsOn: 1 });

    const weekStarts = eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: 1 }
    );

    const completionSet = new Set(habit.completions);

    const weeksData = weekStarts.map((weekStart) => {
      return Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
          date,
          dateStr,
          completed: completionSet.has(dateStr),
          isFuture: isFuture(date) && !isToday(date),
          isToday: isToday(date),
        };
      });
    });

    // Calculate month label positions
    const markers: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeksData.forEach((week, weekIndex) => {
      const firstDay = week[0].date;
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        markers.push({ month: MONTH_LABELS[month], weekIndex });
        lastMonth = month;
      }
    });

    return { weeks: weeksData, monthMarkers: markers };
  }, [habit.completions]);

  function handleCellMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    dateStr: string,
    completed: boolean
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      date: dateStr,
      completed,
      x: rect.left + rect.width / 2,
      y: rect.top,
      visible: true,
    });
  }

  function handleCellMouseLeave() {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {weeks.map((_, weekIndex) => {
          const marker = monthMarkers.find((m) => m.weekIndex === weekIndex);
          return (
            <div
              key={weekIndex}
              className="flex-shrink-0"
              style={{ width: 14, marginRight: 2 }}
            >
              {marker && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {marker.month}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="flex items-center justify-end"
              style={{ height: 14, marginBottom: 2 }}
            >
              <span className="text-xs text-gray-400 dark:text-gray-500 leading-none">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-thin pb-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map(({ date, dateStr, completed, isFuture: isFutureDate, isToday: isTodayDate }) => (
                <div
                  key={dateStr}
                  className={cn(
                    'heatmap-cell flex-shrink-0',
                    !completed && !isFutureDate && !isTodayDate
                      ? 'bg-gray-100 dark:bg-gray-700/50'
                      : ''
                  )}
                  style={{
                    width: 14,
                    height: 14,
                    ...getCellColor(completed, isFutureDate, habit.color, isTodayDate),
                    opacity: isFutureDate ? 0.3 : 1,
                  }}
                  onMouseEnter={(e) => handleCellMouseEnter(e, dateStr, completed)}
                  onMouseLeave={handleCellMouseLeave}
                  role="gridcell"
                  aria-label={`${dateStr}: ${completed ? 'completed' : 'not completed'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-gray-400 dark:text-gray-500">Less</span>
        {[0.15, 0.35, 0.55, 0.75, 1].map((opacity) => (
          <div
            key={opacity}
            className="w-3 h-3 rounded-sm"
            style={{
              backgroundColor:
                opacity === 0.15
                  ? '#e5e7eb'
                  : habit.color,
              opacity: opacity === 0.15 ? 1 : opacity,
            }}
          />
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500">More</span>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <p className="font-medium">
            {format(parseISO(tooltip.date), 'MMM d, yyyy')}
          </p>
          <p className={tooltip.completed ? 'text-green-400' : 'text-gray-400'}>
            {tooltip.completed ? 'Completed' : 'Not completed'}
          </p>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #111827',
            }}
          />
        </div>
      )}
    </div>
  );
}
