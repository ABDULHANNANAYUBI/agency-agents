'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Flame, ChevronRight } from 'lucide-react';
import { Habit } from '@/lib/types';
import { useStore } from '@/lib/store';
import { cn, formatDate, getStreak, CATEGORY_CONFIG, FREQUENCY_LABELS } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  showStreaks?: boolean;
  onToggle?: (completed: boolean) => void;
}

export function HabitCard({ habit, showStreaks = true, onToggle }: HabitCardProps) {
  const toggleCompletion = useStore((state) => state.toggleCompletion);
  const todayStr = formatDate(new Date());
  const isCompleted = habit.completions.includes(todayStr);
  const streak = getStreak(habit);
  const categoryConfig = CATEGORY_CONFIG[habit.category];
  const [isAnimating, setIsAnimating] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    await toggleCompletion(habit.id, todayStr);
    onToggle?.(!isCompleted);
  }

  return (
    <div
      className={cn(
        'group bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        isCompleted
          ? 'border-indigo-200 dark:border-indigo-700/50 bg-indigo-50/30 dark:bg-indigo-900/10'
          : 'border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'habit-checkbox flex-shrink-0',
            isCompleted
              ? 'border-transparent shadow-sm'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500',
            isAnimating && 'checked'
          )}
          style={
            isCompleted
              ? { backgroundColor: habit.color }
              : { borderColor: habit.color + '66' }
          }
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          aria-pressed={isCompleted}
        >
          {isCompleted && (
            <svg
              className="w-3.5 h-3.5 text-white animate-check-pop"
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
        </button>

        {/* Emoji */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: habit.color + '20' }}
        >
          {habit.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={cn(
                'font-semibold text-gray-900 dark:text-white truncate',
                isCompleted && 'line-through text-gray-400 dark:text-gray-500'
              )}
            >
              {habit.name}
            </h3>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                categoryConfig.bgClass,
                categoryConfig.textClass
              )}
            >
              {categoryConfig.label}
            </span>
          </div>
          {habit.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {habit.description}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {FREQUENCY_LABELS[habit.frequency]}
          </p>
        </div>

        {/* Streak Badge */}
        {showStreaks && streak > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex-shrink-0">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
              {streak}
            </span>
          </div>
        )}

        {/* Link to detail */}
        <Link
          href={`/habits/${habit.id}`}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          aria-label={`View details for ${habit.name}`}
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Completion status bar */}
      <div
        className="h-1 rounded-b-2xl transition-all duration-500"
        style={{
          backgroundColor: isCompleted ? habit.color : 'transparent',
          opacity: isCompleted ? 0.6 : 0,
        }}
      />
    </div>
  );
}
