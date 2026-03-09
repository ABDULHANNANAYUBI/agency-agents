export type Category =
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'learning'
  | 'social'
  | 'finance'
  | 'productivity'
  | 'other';

export type Frequency = 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: Category;
  color: string;
  emoji: string;
  frequency: Frequency;
  customDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  createdAt: string;    // ISO date string
  completions: string[]; // YYYY-MM-DD strings
  archived: boolean;
}

export interface HabitFormData {
  name: string;
  description: string;
  category: Category;
  color: string;
  emoji: string;
  frequency: Frequency;
  customDays: number[];
}

/** Authenticated user (no password — backend owns credentials). */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

// ── Store shape ───────────────────────────────────────────────────────────────

export interface StoreState {
  /** Currently authenticated user, null when logged out. */
  currentUser: { id: string; name: string; email: string } | null;
  /** Flat array of habits for the current user (synced with backend). */
  habits: Habit[];
  /** True while an async operation is in flight. */
  isLoading: boolean;
  /** Set once initAuth() finishes so AuthGuard doesn't flash a redirect. */
  isInitialized: boolean;
  /** Last error message from an API call, null when clear. */
  error: string | null;
  /** Dark mode preference (local). */
  darkMode: boolean;

  // ── Auth actions ──────────────────────────────────────────────────────────
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  /** Restore session on app load from stored JWT. */
  initAuth: () => Promise<void>;

  // ── Habit actions ─────────────────────────────────────────────────────────
  loadHabits: () => Promise<void>;
  addHabit: (data: HabitFormData) => Promise<void>;
  updateHabit: (id: string, data: Partial<HabitFormData>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  toggleCompletion: (id: string, date: string) => Promise<void>;

  // ── UI actions ────────────────────────────────────────────────────────────
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  clearError: () => void;
}

// ── Misc display types ────────────────────────────────────────────────────────

export interface CategoryConfig {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface DayCompletionData {
  date: string;
  completed: boolean;
  count: number;
}

export interface WeeklyData {
  day: string;
  completed: number;
  total: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}
