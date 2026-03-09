'use client';

import { useMemo, useEffect } from 'react';
import {
  BarChart2,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Award,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useStore, useCurrentHabits } from '@/lib/store';
import { WeeklyChart } from '@/components/WeeklyChart';
import { CategoryChart } from '@/components/CategoryChart';
import { StatsCard } from '@/components/StatsCard';
import { ProgressRing } from '@/components/ProgressRing';
import {
  cn,
  getStreak,
  getLongestStreak,
  getCompletionRate,
  formatDate,
  isHabitDueOnDate,
  CATEGORY_CONFIG,
  getTodayStats,
} from '@/lib/utils';
import { Habit, Category } from '@/lib/types';

export default function StatsPage() {
  const habits = useCurrentHabits();
  const currentUser = useStore((s) => s.currentUser);
  const loadHabits = useStore((s) => s.loadHabits);
  const isLoading = useStore((s) => s.isLoading);
  const activeHabits = habits.filter((h) => !h.archived);

  useEffect(() => {
    if (currentUser) {
      loadHabits();
    }
  }, [currentUser, loadHabits]);

  const stats = useMemo(() => getTodayStats(habits), [habits]);

  const habitsByStreak = useMemo(
    () =>
      [...activeHabits]
        .map((h) => ({ habit: h, streak: getStreak(h) }))
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 5),
    [activeHabits]
  );

  const habitsByRate = useMemo(
    () =>
      [...activeHabits]
        .map((h) => ({ habit: h, rate: getCompletionRate(h, 30) }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5),
    [activeHabits]
  );

  const allTimeCompletions = habits.reduce(
    (acc, h) => acc + h.completions.length,
    0
  );

  const longestEverStreak = useMemo(
    () =>
      habits.reduce((best, h) => {
        const l = getLongestStreak(h);
        return l > best ? l : best;
      }, 0),
    [habits]
  );

  const monthlyData = useMemo(() => {
    return Array.from({ length: 4 }, (_, weekIndex) => {
      const weekEnd = subDays(new Date(), weekIndex * 7);
      const weekStart = subDays(weekEnd, 6);
      const label = `${format(weekStart, 'MMM d')}–${format(weekEnd, 'MMM d')}`;

      let totalDue = 0;
      let totalCompleted = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = subDays(weekEnd, dayOffset);
        const dateStr = formatDate(date);
        activeHabits.forEach((habit) => {
          if (isHabitDueOnDate(habit, date)) {
            totalDue++;
            if (habit.completions.includes(dateStr)) totalCompleted++;
          }
        });
      }

      return {
        label,
        rate: totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0,
        completed: totalCompleted,
        due: totalDue,
      };
    }).reverse();
  }, [activeHabits]);

  const categoryStats = useMemo(() => {
    const catMap = new Map<
      Category,
      { count: number; completions: number; rate: number }
    >();

    activeHabits.forEach((habit) => {
      const existing = catMap.get(habit.category) || {
        count: 0,
        completions: 0,
        rate: 0,
      };
      catMap.set(habit.category, {
        count: existing.count + 1,
        completions: existing.completions + habit.completions.length,
        rate: 0,
      });
    });

    activeHabits.forEach((habit) => {
      const existing = catMap.get(habit.category);
      if (existing) {
        catMap.set(habit.category, {
          ...existing,
          rate: existing.rate + getCompletionRate(habit, 30),
        });
      }
    });

    return Array.from(catMap.entries()).map(([category, data]) => ({
      category,
      config: CATEGORY_CONFIG[category],
      count: data.count,
      completions: data.completions,
      avgRate: data.count > 0 ? Math.round(data.rate / data.count) : 0,
    }));
  }, [activeHabits]);

  if (isLoading && habits.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (activeHabits.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No data yet
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Add some habits and complete them to see your statistics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Statistics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Your habit performance overview
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Habits"
          value={activeHabits.length}
          subtitle="active habits"
          icon={Target}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-900/30"
        />
        <StatsCard
          title="All-Time Completions"
          value={allTimeCompletions}
          subtitle="total check-ins"
          icon={CheckCircle2}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
        />
        <StatsCard
          title="Longest Streak Ever"
          value={`${longestEverStreak}d`}
          subtitle="best achievement"
          icon={Trophy}
          iconColor="text-amber-500"
          iconBg="bg-amber-50 dark:bg-amber-900/30"
        />
        <StatsCard
          title="Today's Rate"
          value={`${stats.completionRate}%`}
          subtitle={`${stats.completedToday}/${stats.dueToday} done`}
          icon={TrendingUp}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-50 dark:bg-violet-900/30"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Last 7 Days
          </h2>
          <WeeklyChart habits={activeHabits} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            By Category
          </h2>
          <CategoryChart habits={activeHabits} />
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Weekly Completion Trend (Last 4 Weeks)
        </h2>
        <div className="space-y-4">
          {monthlyData.map((week, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">
                {week.label}
              </span>
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${week.rate}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right tabular-nums">
                {week.rate}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Best Streaks + Best Completion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Best Current Streaks
          </h2>
          <div className="space-y-3">
            {habitsByStreak.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                No streaks yet
              </p>
            ) : (
              habitsByStreak.map(({ habit, streak }, index) => (
                <div key={habit.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-5 text-center">
                    {index + 1}
                  </span>
                  <span className="text-xl w-8 flex-shrink-0 text-center">
                    {habit.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (streak / (habitsByStreak[0]?.streak || 1)) * 100)}%`,
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                      {streak}d
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            Best 30-Day Completion
          </h2>
          <div className="space-y-3">
            {habitsByRate.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                No completion data yet
              </p>
            ) : (
              habitsByRate.map(({ habit, rate }, index) => (
                <div key={habit.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-5 text-center">
                    {index + 1}
                  </span>
                  <span className="text-xl w-8 flex-shrink-0 text-center">
                    {habit.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {habit.name}
                    </p>
                    <div className="mt-0.5">
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${rate}%`,
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-bold tabular-nums flex-shrink-0',
                      rate >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : rate >= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-500 dark:text-red-400'
                    )}
                  >
                    {rate}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-5 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Category Breakdown
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryStats.map(({ category, config, count, completions, avgRate }) => (
              <div
                key={category}
                className={cn('rounded-xl p-4 border', config.bgClass, config.borderClass)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('text-sm font-semibold', config.textClass)}>
                    {config.label}
                  </span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {count} habit{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Avg rate</span>
                      <span className={cn('font-medium', config.textClass)}>{avgRate}%</span>
                    </div>
                    <div className="h-1.5 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${avgRate}%`, backgroundColor: config.color }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {completions} total completions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Habit Progress Rings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Individual Habit Rates (30 Days)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {activeHabits.map((habit) => {
            const rate = getCompletionRate(habit, 30);
            return (
              <div key={habit.id} className="flex flex-col items-center gap-2">
                <ProgressRing
                  percentage={rate}
                  size={72}
                  strokeWidth={7}
                  color={habit.color}
                  label=""
                />
                <div className="text-center">
                  <span className="text-lg">{habit.emoji}</span>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px] text-center">
                    {habit.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
