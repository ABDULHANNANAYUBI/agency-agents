import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  parseISO,
  differenceInDays,
  subDays,
  getDay,
  startOfDay,
} from 'date-fns';
import { Habit, Category, CategoryConfig, WeeklyData } from './types';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function isHabitDueToday(habit: Habit): boolean {
  const today = new Date();
  const dayOfWeek = getDay(today); // 0=Sun, 1=Mon, ..., 6=Sat

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'weekly': {
      const todayStr = formatDate(today);
      const weekStart = formatDate(startOfWeek(today, { weekStartsOn: 1 }));
      const weekEnd = formatDate(endOfWeek(today, { weekStartsOn: 1 }));
      const completedThisWeek = habit.completions.some((c) => {
        return c >= weekStart && c <= weekEnd;
      });
      return !completedThisWeek;
    }
    case 'custom':
      return habit.customDays.includes(dayOfWeek);
    default:
      return true;
  }
}

export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  const dayOfWeek = getDay(date);

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'weekly':
      return dayOfWeek === 1; // Mondays
    case 'custom':
      return habit.customDays.includes(dayOfWeek);
    default:
      return true;
  }
}

export function getStreak(habit: Habit): number {
  if (habit.completions.length === 0) return 0;

  const today = startOfDay(new Date());
  const todayStr = formatDate(today);
  const completionSet = new Set(habit.completions);

  let streak = 0;
  let currentDate = today;

  // Check if today is completed or if habit isn't due today
  const todayCompleted = completionSet.has(todayStr);
  const dueToday = isHabitDueOnDate(habit, today);

  if (!todayCompleted && dueToday) {
    // Start from yesterday if today not completed but was due
    currentDate = subDays(today, 1);
  }

  // Count consecutive completions going backwards
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(currentDate);
    const isDue = isHabitDueOnDate(habit, currentDate);

    if (!isDue) {
      currentDate = subDays(currentDate, 1);
      continue;
    }

    if (completionSet.has(dateStr)) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getLongestStreak(habit: Habit): number {
  if (habit.completions.length === 0) return 0;

  const sorted = [...habit.completions].sort();
  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1]);
    const curr = parseISO(sorted[i]);
    const diff = differenceInDays(curr, prev);

    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diff > 1) {
      currentStreak = 1;
    }
  }

  return Math.max(maxStreak, currentStreak);
}

export function getCompletionRate(habit: Habit, days = 30): number {
  const today = new Date();
  const startDate = subDays(today, days - 1);
  const completionSet = new Set(habit.completions);

  let dueCount = 0;
  let completedCount = 0;

  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    if (isHabitDueOnDate(habit, date)) {
      dueCount++;
      if (completionSet.has(formatDate(date))) {
        completedCount++;
      }
    }
  }

  if (dueCount === 0) return 0;
  return Math.round((completedCount / dueCount) * 100);
}

export function getWeeklyData(habits: Habit[]): WeeklyData[] {
  const today = new Date();
  const activeHabits = habits.filter((h) => !h.archived);

  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = formatDate(date);
    const dayLabel = format(date, 'EEE');

    const dueHabits = activeHabits.filter((h) => isHabitDueOnDate(h, date));
    const completedHabits = dueHabits.filter((h) =>
      h.completions.includes(dateStr)
    );

    return {
      day: dayLabel,
      completed: completedHabits.length,
      total: dueHabits.length,
    };
  });
}

export function getTodayStats(habits: Habit[]) {
  const activeHabits = habits.filter((h) => !h.archived);
  const todayStr = formatDate(new Date());
  const dueToday = activeHabits.filter((h) => isHabitDueToday(h));
  const completedToday = dueToday.filter((h) => h.completions.includes(todayStr));

  const totalCompletionsThisWeek = activeHabits.reduce((acc, habit) => {
    const today = new Date();
    const weekStart = formatDate(startOfWeek(today, { weekStartsOn: 1 }));
    const weekEnd = formatDate(today);
    return (
      acc +
      habit.completions.filter((c) => c >= weekStart && c <= weekEnd).length
    );
  }, 0);

  const bestCurrentStreak = activeHabits.reduce((best, habit) => {
    const streak = getStreak(habit);
    return streak > best ? streak : best;
  }, 0);

  return {
    totalHabits: activeHabits.length,
    dueToday: dueToday.length,
    completedToday: completedToday.length,
    completionRate:
      dueToday.length > 0
        ? Math.round((completedToday.length / dueToday.length) * 100)
        : 0,
    totalCompletionsThisWeek,
    bestCurrentStreak,
  };
}

export function getCategoryData(habits: Habit[]) {
  const activeHabits = habits.filter((h) => !h.archived);
  const categoryMap = new Map<string, number>();

  activeHabits.forEach((habit) => {
    categoryMap.set(habit.category, (categoryMap.get(habit.category) || 0) + 1);
  });

  return Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
    config: CATEGORY_CONFIG[name as Category],
  }));
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  health: {
    label: 'Health',
    color: '#ef4444',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-300 dark:border-red-700',
  },
  fitness: {
    label: 'Fitness',
    color: '#f97316',
    bgClass: 'bg-orange-100 dark:bg-orange-900/30',
    textClass: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-300 dark:border-orange-700',
  },
  mindfulness: {
    label: 'Mindfulness',
    color: '#8b5cf6',
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    textClass: 'text-violet-700 dark:text-violet-400',
    borderClass: 'border-violet-300 dark:border-violet-700',
  },
  learning: {
    label: 'Learning',
    color: '#06b6d4',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
    textClass: 'text-cyan-700 dark:text-cyan-400',
    borderClass: 'border-cyan-300 dark:border-cyan-700',
  },
  social: {
    label: 'Social',
    color: '#ec4899',
    bgClass: 'bg-pink-100 dark:bg-pink-900/30',
    textClass: 'text-pink-700 dark:text-pink-400',
    borderClass: 'border-pink-300 dark:border-pink-700',
  },
  finance: {
    label: 'Finance',
    color: '#10b981',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
  },
  productivity: {
    label: 'Productivity',
    color: '#3b82f6',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-300 dark:border-blue-700',
  },
  other: {
    label: 'Other',
    color: '#6b7280',
    bgClass: 'bg-gray-100 dark:bg-gray-800',
    textClass: 'text-gray-700 dark:text-gray-400',
    borderClass: 'border-gray-300 dark:border-gray-600',
  },
};

export const PRESET_EMOJIS = [
  '💪', '🏃', '🧘', '📚', '💧', '🥗', '😴', '🎯',
  '💰', '🧹', '✍️', '🎵', '🧠', '❤️', '🌱', '🏋️',
  '🚴', '🧗', '🏊', '🍎', '☕', '🛏️', '📝', '🎨',
  '🌞', '🧘‍♀️', '🤸', '🏆', '⭐', '🔥', '💊', '🥤',
];

export const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#10b981', '#06b6d4',
  '#3b82f6', '#6b7280',
];

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Every day',
  weekdays: 'Weekdays (Mon–Fri)',
  weekends: 'Weekends (Sat–Sun)',
  weekly: 'Once a week',
  custom: 'Custom days',
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
