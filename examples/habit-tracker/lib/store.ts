import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StoreState, Habit, HabitFormData } from './types';
import {
  authApi,
  habitsApi,
  setToken,
  removeToken,
  getToken,
} from './api';

// Map backend HabitResponse to local Habit type
function mapHabit(h: {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  emoji: string;
  frequency: string;
  customDays: number[];
  completions: string[];
  archived: boolean;
  createdAt: string;
}): Habit {
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    category: h.category as Habit['category'],
    color: h.color,
    emoji: h.emoji,
    frequency: h.frequency as Habit['frequency'],
    customDays: h.customDays,
    completions: h.completions,
    archived: h.archived,
    createdAt: h.createdAt,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      habits: [],
      isLoading: false,
      isInitialized: false,
      error: null,
      darkMode: false,

      // ── Auth ──────────────────────────────────────────────────────────────

      signUp: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const resp = await authApi.register(name, email, password);
          setToken(resp.token);
          set({
            currentUser: { id: resp.userId, name: resp.name, email: resp.email },
            habits: [],
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Registration failed';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const resp = await authApi.login(email, password);
          setToken(resp.token);
          set({
            currentUser: { id: resp.userId, name: resp.name, email: resp.email },
            habits: [],
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Sign in failed';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      signOut: () => {
        removeToken();
        set({ currentUser: null, habits: [], error: null });
      },

      initAuth: async () => {
        const token = getToken();
        if (!token) {
          set({ isInitialized: true });
          return;
        }
        try {
          const user = await authApi.me();
          set({
            currentUser: { id: user.id, name: user.name, email: user.email },
            isInitialized: true,
          });
        } catch {
          // Token expired or invalid — clear it
          removeToken();
          set({ currentUser: null, habits: [], isInitialized: true });
        }
      },

      // ── Habits ────────────────────────────────────────────────────────────

      loadHabits: async () => {
        set({ isLoading: true, error: null });
        try {
          const raw = await habitsApi.getAll();
          set({ habits: raw.map(mapHabit), isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to load habits';
          set({ isLoading: false, error: message });
        }
      },

      addHabit: async (data: HabitFormData) => {
        set({ isLoading: true, error: null });
        try {
          const raw = await habitsApi.create(data);
          set((state) => ({
            habits: [mapHabit(raw), ...state.habits],
            isLoading: false,
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to create habit';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      updateHabit: async (id: string, data: Partial<HabitFormData>) => {
        set({ error: null });
        try {
          const raw = await habitsApi.update(id, data);
          set((state) => ({
            habits: state.habits.map((h) => (h.id === id ? mapHabit(raw) : h)),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to update habit';
          set({ error: message });
          throw err;
        }
      },

      deleteHabit: async (id: string) => {
        set({ error: null });
        try {
          await habitsApi.delete(id);
          set((state) => ({
            habits: state.habits.filter((h) => h.id !== id),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to delete habit';
          set({ error: message });
          throw err;
        }
      },

      archiveHabit: async (id: string) => {
        set({ error: null });
        try {
          const raw = await habitsApi.toggleArchive(id);
          set((state) => ({
            habits: state.habits.map((h) => (h.id === id ? mapHabit(raw) : h)),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to archive habit';
          set({ error: message });
          throw err;
        }
      },

      toggleCompletion: async (id: string, date: string) => {
        set({ error: null });
        try {
          const raw = await habitsApi.toggleCompletion(id, date);
          set((state) => ({
            habits: state.habits.map((h) => (h.id === id ? mapHabit(raw) : h)),
          }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to toggle completion';
          set({ error: message });
          throw err;
        }
      },

      // ── UI ─────────────────────────────────────────────────────────────────

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value: boolean) => set({ darkMode: value }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'habit-tracker-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist UI preferences; auth state is restored via JWT on init
      partialize: (state) => ({
        darkMode: state.darkMode,
      }),
    }
  )
);

/** Selector: returns current user's habits reactively. */
export const useCurrentHabits = () => useStore((s) => s.habits);
