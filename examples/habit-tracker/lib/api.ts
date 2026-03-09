// ─────────────────────────────────────────────────────────────────────────────
// Typed API client for the HabitTracker .NET backend
// Token is stored in localStorage under 'habit-tracker-token'
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
const TOKEN_KEY = 'habit-tracker-token';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as ApiError).error ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

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

export interface HabitResponse {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  color: string;
  emoji: string;
  frequency: string;
  customDays: number[];
  completions: string[];   // YYYY-MM-DD strings
  archived: boolean;
  createdAt: string;
}

export interface HabitFormData {
  name: string;
  description: string;
  category: string;
  color: string;
  emoji: string;
  frequency: string;
  customDays: number[];
}

export interface StatsResponse {
  totalHabits: number;
  dueToday: number;
  completedToday: number;
  completionRate: number;
  totalCompletionsThisWeek: number;
  bestCurrentStreak: number;
  weeklyData: WeeklyDataPoint[];
  categoryData: CategoryDataPoint[];
}

export interface WeeklyDataPoint {
  day: string;
  completed: number;
  total: number;
}

export interface CategoryDataPoint {
  name: string;
  count: number;
}

export interface ApiError {
  error: string;
  statusCode?: number;
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<UserDto>('/api/auth/me'),
};

// ── Habits API ────────────────────────────────────────────────────────────────

export const habitsApi = {
  getAll: () =>
    apiFetch<HabitResponse[]>('/api/habits'),

  getById: (id: string) =>
    apiFetch<HabitResponse>(`/api/habits/${id}`),

  create: (data: HabitFormData) =>
    apiFetch<HabitResponse>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<HabitFormData>) =>
    apiFetch<HabitResponse>(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/api/habits/${id}`, { method: 'DELETE' }),

  toggleArchive: (id: string) =>
    apiFetch<HabitResponse>(`/api/habits/${id}/archive`, { method: 'PATCH' }),

  toggleCompletion: (id: string, date: string) =>
    apiFetch<HabitResponse>(`/api/habits/${id}/completions/${date}`, {
      method: 'POST',
    }),
};

// ── Stats API ─────────────────────────────────────────────────────────────────

export const statsApi = {
  get: () => apiFetch<StatsResponse>('/api/stats'),
};
