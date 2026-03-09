'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Flame,
  TrendingUp,
  Calendar,
  Plus,
  Sparkles,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';
import { useStore, useCurrentHabits } from '@/lib/store';
import { HabitCard } from '@/components/HabitCard';
import { StatsCard } from '@/components/StatsCard';
import { ProgressRing } from '@/components/ProgressRing';
import { ToastContainer, useToasts } from '@/components/Toast';
import { isHabitDueToday, getTodayStats, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const habits = useCurrentHabits();
  const currentUser = useStore((s) => s.currentUser);
  const loadHabits = useStore((s) => s.loadHabits);
  const isLoading = useStore((s) => s.isLoading);
  const { toasts, addToast, removeToast } = useToasts();

  // Load habits from the backend whenever the user is authenticated
  useEffect(() => {
    if (currentUser) {
      loadHabits();
    }
  }, [currentUser, loadHabits]);

  const activeHabits = habits.filter((h) => !h.archived);
  const todayHabits = activeHabits.filter(isHabitDueToday);
  const otherHabits = activeHabits.filter((h) => !isHabitDueToday(h));
  const todayStr = formatDate(new Date());
  const stats = useMemo(() => getTodayStats(habits), [habits]);

  const completedToday = todayHabits.filter((h) =>
    h.completions.includes(todayStr)
  );
  const pendingToday = todayHabits.filter(
    (h) => !h.completions.includes(todayStr)
  );

  const today = new Date();
  const dayName = format(today, 'EEEE');
  const dateString = format(today, 'MMMM d, yyyy');

  const firstName = currentUser?.name.split(' ')[0] ?? 'there';

  function handleToggle(habitName: string, completed: boolean) {
    addToast(
      completed ? `${habitName} completed!` : `${habitName} marked incomplete`,
      completed ? 'success' : 'info'
    );
  }

  // Loading skeleton for first load
  if (isLoading && habits.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Good {getGreeting()},{' '}
              <span className="gradient-text">{firstName}!</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {dayName}, {dateString}
            </p>
          </div>
          <Link
            href="/habits"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Habits"
            value={stats.totalHabits}
            subtitle="active habits"
            icon={CheckSquare}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-900/30"
          />
          <StatsCard
            title="Due Today"
            value={`${stats.completedToday}/${stats.dueToday}`}
            subtitle="completed today"
            icon={Target}
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-50 dark:bg-violet-900/30"
          />
          <StatsCard
            title="Best Streak"
            value={`${stats.bestCurrentStreak}d`}
            subtitle="current best"
            icon={Flame}
            iconColor="text-orange-500 dark:text-orange-400"
            iconBg="bg-orange-50 dark:bg-orange-900/30"
          />
          <StatsCard
            title="This Week"
            value={stats.totalCompletionsThisWeek}
            subtitle="total completions"
            icon={TrendingUp}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          />
        </div>

        {/* Today's Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Ring Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center gap-4">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Today&apos;s Progress
            </h2>
            <ProgressRing
              percentage={stats.completionRate}
              size={140}
              strokeWidth={12}
              color="#6366f1"
              label="done"
            />
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedToday}
                <span className="text-gray-400 dark:text-gray-500 font-normal">
                  /{stats.dueToday}
                </span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                habits completed
              </p>
            </div>
          </div>

          {/* Progress Bar Overview */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Completion Progress
              </h2>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {stats.completionRate}%
              </span>
            </div>

            {/* Big progress bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                style={{ width: `${stats.completionRate}%` }}
                role="progressbar"
                aria-valuenow={stats.completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {/* Mini progress bars per habit */}
            <div className="space-y-3">
              {todayHabits.slice(0, 5).map((habit) => {
                const completed = habit.completions.includes(todayStr);
                return (
                  <div key={habit.id} className="flex items-center gap-3">
                    <span className="text-lg w-6 flex-shrink-0">{habit.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {habit.name}
                        </span>
                        <span
                          className={`text-xs font-medium flex-shrink-0 ml-2 ${
                            completed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {completed ? 'Done' : 'Pending'}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: completed ? '100%' : '0%',
                            backgroundColor: habit.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {todayHabits.length > 5 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  +{todayHabits.length - 5} more habits
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Today's Habits List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Due Today
              {pendingToday.length > 0 && (
                <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                  {pendingToday.length} remaining
                </span>
              )}
            </h2>
            {completedToday.length === todayHabits.length &&
              todayHabits.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="w-4 h-4" />
                  All done!
                </div>
              )}
          </div>

          {todayHabits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {/* Pending habits first */}
              {pendingToday.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={(completed) => handleToggle(habit.name, completed)}
                />
              ))}
              {/* Separator */}
              {completedToday.length > 0 && pendingToday.length > 0 && (
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    Completed ({completedToday.length})
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>
              )}
              {/* Completed habits */}
              {completedToday.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={(completed) => handleToggle(habit.name, completed)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Not Due Today */}
        {otherHabits.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <span>Not due today</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">
                {otherHabits.length}
              </span>
            </h2>
            <div className="space-y-2 opacity-60">
              {otherHabits.slice(0, 3).map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <span className="text-xl">{habit.emoji}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">
                    {habit.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Not due
                  </span>
                </div>
              ))}
              {otherHabits.length > 3 && (
                <Link
                  href="/habits"
                  className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline py-2"
                >
                  View all {otherHabits.length} habits
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No habits for today
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
        Start building your routine by adding your first habit. Small steps lead
        to big changes!
      </p>
      <Link
        href="/habits"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create your first habit
      </Link>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
