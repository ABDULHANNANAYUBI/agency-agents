'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Pencil,
  Target,
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { useStore, useCurrentHabits } from '@/lib/store';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import { StatsCard } from '@/components/StatsCard';
import { HabitForm } from '@/components/HabitForm';
import { ToastContainer, useToasts } from '@/components/Toast';
import {
  cn,
  formatDate,
  getStreak,
  getLongestStreak,
  getCompletionRate,
  isHabitDueToday,
  isHabitDueOnDate,
  CATEGORY_CONFIG,
  FREQUENCY_LABELS,
} from '@/lib/utils';

interface HabitDetailPageProps {
  params: { id: string };
}

export default function HabitDetailPage({ params }: HabitDetailPageProps) {
  const habits = useCurrentHabits();
  const currentUser = useStore((s) => s.currentUser);
  const loadHabits = useStore((s) => s.loadHabits);
  const toggleCompletion = useStore((state) => state.toggleCompletion);
  const isLoading = useStore((s) => s.isLoading);
  const { toasts, addToast, removeToast } = useToasts();
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (currentUser && habits.length === 0) {
      loadHabits();
    }
  }, [currentUser, habits.length, loadHabits]);

  const habit = habits.find((h) => h.id === params.id);

  if (isLoading && habits.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Habit not found
        </h2>
        <Link href="/habits" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Go back to habits
        </Link>
      </div>
    );
  }

  const todayStr = formatDate(new Date());
  const completedToday = habit.completions.includes(todayStr);
  const dueToday = isHabitDueToday(habit);
  const streak = getStreak(habit);
  const longestStreak = getLongestStreak(habit);
  const rate30 = getCompletionRate(habit, 30);
  const rate7 = getCompletionRate(habit, 7);
  const categoryConfig = CATEGORY_CONFIG[habit.category];

  async function handleToggleToday() {
    try {
      await toggleCompletion(habit!.id, todayStr);
      addToast(
        !completedToday ? `${habit!.name} completed!` : 'Marked as incomplete',
        !completedToday ? 'success' : 'info'
      );
    } catch {
      addToast('Failed to update completion', 'error');
    }
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = formatDate(date);
    const isDue = isHabitDueOnDate(habit, date);
    const completed = habit.completions.includes(dateStr);
    return { date, dateStr, isDue, completed };
  });

  const totalCompletions = habit.completions.length;
  const createdDate = format(parseISO(habit.createdAt), 'MMMM d, yyyy');

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Back + Header */}
        <div>
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Habits
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-1.5 h-16 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: habit.color + '25' }}
                >
                  {habit.emoji}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {habit.name}
                  </h1>
                  {habit.archived && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">
                      Archived
                    </span>
                  )}
                </div>
                {habit.description && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                    {habit.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium',
                      categoryConfig.bgClass,
                      categoryConfig.textClass
                    )}
                  >
                    {categoryConfig.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {FREQUENCY_LABELS[habit.frequency]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Since {createdDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowEdit(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              {!habit.archived && dueToday && (
                <button
                  onClick={handleToggleToday}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm',
                    completedToday
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completedToday ? 'Completed!' : 'Mark Complete'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Current Streak"
            value={`${streak}d`}
            subtitle="consecutive days"
            icon={Flame}
            iconColor="text-orange-500"
            iconBg="bg-orange-50 dark:bg-orange-900/30"
          />
          <StatsCard
            title="Best Streak"
            value={`${longestStreak}d`}
            subtitle="all time record"
            icon={Trophy}
            iconColor="text-amber-500"
            iconBg="bg-amber-50 dark:bg-amber-900/30"
          />
          <StatsCard
            title="30-Day Rate"
            value={`${rate30}%`}
            subtitle="completion rate"
            icon={Target}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-900/30"
          />
          <StatsCard
            title="Total Done"
            value={totalCompletions}
            subtitle="all time completions"
            icon={CheckCircle2}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          />
        </div>

        {/* Last 7 Days */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Last 7 Days
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {last7Days.map(({ date, dateStr, isDue, completed }) => {
              const isToday = dateStr === todayStr;
              return (
                <div key={dateStr} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {format(date, 'EEE')}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isToday
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      completed
                        ? 'shadow-sm'
                        : isDue
                        ? 'border-2 border-dashed border-gray-200 dark:border-gray-600'
                        : 'bg-gray-50 dark:bg-gray-800'
                    )}
                    style={completed ? { backgroundColor: habit.color } : {}}
                    title={
                      completed ? 'Completed' : isDue ? 'Not completed' : 'Not due'
                    }
                  >
                    {completed && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {!completed && !isDue && (
                      <span className="text-gray-300 dark:text-gray-600 text-lg leading-none">
                        –
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              This week&apos;s completion rate
            </span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${rate7}%`, backgroundColor: habit.color }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                {rate7}%
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Heatmap */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Completion History (52 Weeks)
          </h2>
          <div className="overflow-x-auto scrollbar-thin">
            <CalendarHeatmap habit={habit} />
          </div>
        </div>

        {/* Completion Log */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Recent Completions
          </h2>
          {habit.completions.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              No completions recorded yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {[...habit.completions]
                .sort((a, b) => b.localeCompare(a))
                .slice(0, 20)
                .map((dateStr) => (
                  <div
                    key={dateStr}
                    className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {format(parseISO(dateStr), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Done
                    </span>
                  </div>
                ))}
              {habit.completions.length > 20 && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">
                  +{habit.completions.length - 20} more completions
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <HabitForm
          habit={habit}
          onClose={() => setShowEdit(false)}
          onSave={() => addToast('Habit updated!', 'success')}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
