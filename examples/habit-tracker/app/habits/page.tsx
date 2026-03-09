'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
  Flame,
  ChevronRight,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { Habit, Category } from '@/lib/types';
import { useStore, useCurrentHabits } from '@/lib/store';
import { HabitForm } from '@/components/HabitForm';
import { ToastContainer, useToasts } from '@/components/Toast';
import {
  cn,
  getStreak,
  getCompletionRate,
  isHabitDueToday,
  CATEGORY_CONFIG,
  FREQUENCY_LABELS,
  formatDate,
} from '@/lib/utils';

type FilterMode = 'all' | 'active' | 'archived';
type SortMode = 'name' | 'streak' | 'completion' | 'created';

export default function HabitsPage() {
  const habits = useCurrentHabits();
  const currentUser = useStore((s) => s.currentUser);
  const loadHabits = useStore((s) => s.loadHabits);
  const deleteHabit = useStore((state) => state.deleteHabit);
  const archiveHabit = useStore((state) => state.archiveHabit);
  const isLoading = useStore((s) => s.isLoading);

  const { toasts, addToast, removeToast } = useToasts();

  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('active');
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('created');

  useEffect(() => {
    if (currentUser) {
      loadHabits();
    }
  }, [currentUser, loadHabits]);

  const filteredHabits = useMemo(() => {
    let result = habits;

    if (filterMode === 'active') result = result.filter((h) => !h.archived);
    else if (filterMode === 'archived') result = result.filter((h) => h.archived);

    if (filterCategory !== 'all') {
      result = result.filter((h) => h.category === filterCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.category.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      switch (sortMode) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'streak':
          return getStreak(b) - getStreak(a);
        case 'completion':
          return getCompletionRate(b) - getCompletionRate(a);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [habits, filterMode, filterCategory, searchQuery, sortMode]);

  async function handleDelete(id: string) {
    const habit = habits.find((h) => h.id === id);
    try {
      await deleteHabit(id);
      setDeleteConfirm(null);
      if (habit) addToast(`"${habit.name}" deleted`, 'info');
    } catch {
      addToast('Failed to delete habit', 'error');
    }
  }

  async function handleArchive(id: string) {
    const habit = habits.find((h) => h.id === id);
    try {
      await archiveHabit(id);
      if (habit) {
        addToast(
          habit.archived ? `"${habit.name}" restored` : `"${habit.name}" archived`,
          'info'
        );
      }
    } catch {
      addToast('Failed to update habit', 'error');
    }
  }

  const activeCount = habits.filter((h) => !h.archived).length;
  const archivedCount = habits.filter((h) => h.archived).length;

  const categories = [
    'all' as const,
    ...([...new Set(habits.map((h) => h.category))] as Category[]),
  ];

  if (isLoading && habits.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Habits
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage and track all your habits
            </p>
          </div>
          <button
            onClick={() => {
              setEditingHabit(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 overflow-hidden">
            {(['all', 'active', 'archived'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={cn(
                  'px-3 py-2 text-xs font-medium capitalize transition-colors',
                  filterMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                )}
              >
                {mode}
                <span className="ml-1 opacity-70">
                  {mode === 'active'
                    ? `(${activeCount})`
                    : mode === 'archived'
                    ? `(${archivedCount})`
                    : `(${habits.length})`}
                </span>
              </button>
            ))}
          </div>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Sort habits"
          >
            <option value="created">Latest First</option>
            <option value="name">Name A-Z</option>
            <option value="streak">Best Streak</option>
            <option value="completion">Completion Rate</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const config = cat !== 'all' ? CATEGORY_CONFIG[cat] : null;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    filterCategory === cat
                      ? config
                        ? `${config.bgClass} ${config.textClass} ring-2`
                        : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {cat === 'all' ? 'All Categories' : CATEGORY_CONFIG[cat].label}
                </button>
              );
            })}
          </div>
        )}

        {/* Habits List */}
        {filteredHabits.length === 0 ? (
          <EmptyState
            hasHabits={habits.length > 0}
            onAdd={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-3">
            {filteredHabits.map((habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onEdit={() => {
                  setEditingHabit(habit);
                  setShowForm(true);
                }}
                onArchive={() => handleArchive(habit.id)}
                onDeleteRequest={() => setDeleteConfirm(habit.id)}
                deleteConfirm={deleteConfirm}
                onDeleteConfirm={handleDelete}
                onDeleteCancel={() => setDeleteConfirm(null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          habit={editingHabit ?? undefined}
          onClose={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
          onSave={() => {
            addToast(
              editingHabit ? 'Habit updated!' : 'Habit created!',
              'success'
            );
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

interface HabitListItemProps {
  habit: Habit;
  onEdit: () => void;
  onArchive: () => void;
  onDeleteRequest: () => void;
  deleteConfirm: string | null;
  onDeleteConfirm: (id: string) => void;
  onDeleteCancel: () => void;
}

function HabitListItem({
  habit,
  onEdit,
  onArchive,
  onDeleteRequest,
  deleteConfirm,
  onDeleteConfirm,
  onDeleteCancel,
}: HabitListItemProps) {
  const streak = getStreak(habit);
  const rate = getCompletionRate(habit, 30);
  const categoryConfig = CATEGORY_CONFIG[habit.category];
  const todayStr = formatDate(new Date());
  const completedToday = habit.completions.includes(todayStr);
  const dueToday = isHabitDueToday(habit);

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl border transition-all',
        habit.archived
          ? 'border-gray-100 dark:border-gray-800 opacity-60'
          : 'border-gray-200 dark:border-gray-700 hover:shadow-sm'
      )}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-3 h-10 rounded-full flex-shrink-0"
            style={{ backgroundColor: habit.color }}
          />
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: habit.color + '20' }}
          >
            {habit.emoji}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {habit.name}
            </h3>
            {habit.archived && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                Archived
              </span>
            )}
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
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">
              {habit.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span>{FREQUENCY_LABELS[habit.frequency]}</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              {streak}d streak
            </span>
            <span>{rate}% (30d)</span>
            {!habit.archived && dueToday && (
              <span
                className={cn(
                  'flex items-center gap-1 font-medium',
                  completedToday
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-amber-500 dark:text-amber-400'
                )}
              >
                <CheckSquare className="w-3 h-3" />
                {completedToday ? 'Done today' : 'Due today'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href={`/habits/${habit.id}`}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="View details"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
          {!habit.archived && (
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Edit habit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onArchive}
            className="p-2 rounded-lg text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title={habit.archived ? 'Restore habit' : 'Archive habit'}
          >
            {habit.archived ? (
              <ArchiveRestore className="w-4 h-4" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onDeleteRequest}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {deleteConfirm === habit.id && (
        <div className="px-4 pb-4 pt-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 flex-1">
              Delete &ldquo;{habit.name}&rdquo;? This cannot be undone.
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={onDeleteCancel}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onDeleteConfirm(habit.id)}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  hasHabits,
  onAdd,
}: {
  hasHabits: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
        <CheckSquare className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {hasHabits ? 'No habits found' : 'No habits yet'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
        {hasHabits
          ? 'Try adjusting your filters or search query.'
          : 'Create your first habit to start building your routine.'}
      </p>
      {!hasHabits && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Habit
        </button>
      )}
    </div>
  );
}
