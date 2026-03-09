'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Habit, HabitFormData, Category, Frequency } from '@/lib/types';
import { useStore } from '@/lib/store';
import {
  cn,
  PRESET_EMOJIS,
  PRESET_COLORS,
  CATEGORY_CONFIG,
  DAY_NAMES_FULL,
} from '@/lib/utils';

interface HabitFormProps {
  habit?: Habit;
  onClose: () => void;
  onSave?: () => void;
}

const CATEGORIES: Category[] = [
  'health', 'fitness', 'mindfulness', 'learning',
  'social', 'finance', 'productivity', 'other',
];

const FREQUENCIES: { value: Frequency; label: string; desc: string }[] = [
  { value: 'daily', label: 'Daily', desc: 'Every single day' },
  { value: 'weekdays', label: 'Weekdays', desc: 'Monday through Friday' },
  { value: 'weekends', label: 'Weekends', desc: 'Saturday and Sunday' },
  { value: 'weekly', label: 'Weekly', desc: 'Once per week' },
  { value: 'custom', label: 'Custom', desc: 'Select specific days' },
];

const DEFAULT_FORM: HabitFormData = {
  name: '',
  description: '',
  category: 'health',
  color: '#6366f1',
  emoji: '💪',
  frequency: 'daily',
  customDays: [],
};

export function HabitForm({ habit, onClose, onSave }: HabitFormProps) {
  const addHabit = useStore((state) => state.addHabit);
  const updateHabit = useStore((state) => state.updateHabit);

  const [form, setForm] = useState<HabitFormData>(
    habit
      ? {
          name: habit.name,
          description: habit.description,
          category: habit.category,
          color: habit.color,
          emoji: habit.emoji,
          frequency: habit.frequency,
          customDays: habit.customDays,
        }
      : DEFAULT_FORM
  );

  const [errors, setErrors] = useState<Partial<Record<keyof HabitFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Trap focus in modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function validate(): boolean {
    const newErrors: Partial<Record<keyof HabitFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (form.name.trim().length > 100) newErrors.name = 'Name must be 100 chars or less';
    if (form.frequency === 'custom' && form.customDays.length === 0) {
      newErrors.customDays = 'Select at least one day';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');
    try {
      if (habit) {
        await updateHabit(habit.id, form);
      } else {
        await addHabit(form);
      }
      onSave?.();
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save habit');
    } finally {
      setSubmitting(false);
    }
  }

  function toggleCustomDay(day: number) {
    setForm((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day].sort(),
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-form-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2
            id="habit-form-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto scrollbar-thin flex-1"
        >
          <div className="px-6 py-5 space-y-5">
            {serverError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 text-sm text-red-600 dark:text-red-400">
                {serverError}
              </div>
            )}

            {/* Emoji Picker + Name Row */}
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Emoji
                </label>
                <div className="relative group">
                  <button
                    type="button"
                    className="w-14 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-2xl flex items-center justify-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-slate-700"
                    title="Current emoji"
                  >
                    {form.emoji}
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="habit-name"
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5"
                >
                  Habit Name *
                </label>
                <input
                  id="habit-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Morning Run, Read 30 mins..."
                  className={cn(
                    'w-full h-14 px-3 rounded-xl border text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors',
                    errors.name
                      ? 'border-red-400'
                      : 'border-gray-200 dark:border-gray-600'
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Emoji Grid */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Pick an Emoji
              </label>
              <div className="grid grid-cols-8 gap-1">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, emoji })}
                    className={cn(
                      'w-9 h-9 text-lg rounded-lg transition-all flex items-center justify-center',
                      form.emoji === emoji
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-500 scale-110'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="habit-description"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5"
              >
                Description (optional)
              </label>
              <textarea
                id="habit-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Why is this habit important to you?"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={cn(
                        'px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center',
                        form.category === cat
                          ? `${config.bgClass} ${config.textClass} ${config.borderClass} ring-2 ring-offset-1`
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                      )}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className="w-8 h-8 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Select color ${color}`}
                    aria-pressed={form.color === color}
                  >
                    {form.color === color && (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    )}
                  </button>
                ))}
                {/* Custom color input */}
                <label
                  className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden"
                  title="Custom color"
                  aria-label="Pick custom color"
                >
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="opacity-0 absolute w-1 h-1"
                  />
                  <span className="text-xs text-gray-400">+</span>
                </label>
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Frequency
              </label>
              <div className="space-y-2">
                {FREQUENCIES.map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                      form.frequency === value
                        ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    )}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={value}
                      checked={form.frequency === value}
                      onChange={() => setForm({ ...form, frequency: value })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {form.frequency === 'custom' && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Select Days
                  </p>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES_FULL.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleCustomDay(index)}
                        className={cn(
                          'py-2 rounded-lg text-xs font-medium transition-all',
                          form.customDays.includes(index)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                        aria-pressed={form.customDays.includes(index)}
                        title={day}
                      >
                        {day.slice(0, 1)}
                      </button>
                    ))}
                  </div>
                  {errors.customDays && (
                    <p className="mt-1 text-xs text-red-500">{errors.customDays}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0 bg-gray-50 dark:bg-slate-800/50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? 'Saving…' : habit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
