import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ActiveTimer } from '../types/domain';

interface CookingStoreState {
  activeRecipeId: string | null;
  currentStepByRecipe: Record<string, number>;
  servingsByRecipe: Record<string, number>;
  checkedIngredientsByRecipe: Record<string, string[]>;
  timers: ActiveTimer[];
  setCurrentStep: (recipeId: string, stepIndex: number) => void;
  setServings: (recipeId: string, servings: number) => void;
  toggleIngredient: (recipeId: string, ingredientId: string) => void;
  clearIngredients: (recipeId: string) => void;
  startOrResumeTimer: (params: {
    id: string;
    recipeId: string;
    stepOrder: number;
    label: string;
    durationSeconds: number;
  }) => void;
  pauseTimer: (timerId: string) => void;
  resetTimer: (timerId: string) => void;
  removeTimer: (timerId: string) => void;
  markTimerFinished: (timerId: string) => void;
}

export const useCookingStore = create<CookingStoreState>()(
  persist(
    (set) => ({
      activeRecipeId: null,
      currentStepByRecipe: {},
      servingsByRecipe: {},
      checkedIngredientsByRecipe: {},
      timers: [],

      setCurrentStep: (recipeId, stepIndex) =>
        set((state) => ({
          activeRecipeId: recipeId,
          currentStepByRecipe: {
            ...state.currentStepByRecipe,
            [recipeId]: Math.max(0, stepIndex),
          },
        })),

      setServings: (recipeId, servings) =>
        set((state) => ({
          servingsByRecipe: {
            ...state.servingsByRecipe,
            [recipeId]: Math.max(1, Math.min(16, servings)),
          },
        })),

      toggleIngredient: (recipeId, ingredientId) =>
        set((state) => {
          const existing = state.checkedIngredientsByRecipe[recipeId] ?? [];
          const exists = existing.includes(ingredientId);
          return {
            checkedIngredientsByRecipe: {
              ...state.checkedIngredientsByRecipe,
              [recipeId]: exists
                ? existing.filter((id) => id !== ingredientId)
                : [...existing, ingredientId],
            },
          };
        }),

      clearIngredients: (recipeId) =>
        set((state) => ({
          checkedIngredientsByRecipe: {
            ...state.checkedIngredientsByRecipe,
            [recipeId]: [],
          },
        })),

      startOrResumeTimer: ({ id, recipeId, stepOrder, label, durationSeconds }) =>
        set((state) => {
          const existing = state.timers.find((t) => t.id === id);
          const remaining =
            existing && existing.status === 'paused' && existing.remainingSeconds > 0
              ? existing.remainingSeconds
              : durationSeconds;
          const nextTimer: ActiveTimer = {
            id,
            recipeId,
            stepOrder,
            label,
            durationSeconds,
            remainingSeconds: remaining,
            endTime: Date.now() + remaining * 1000,
            status: 'running',
          };
          return {
            timers: existing
              ? state.timers.map((t) => (t.id === id ? nextTimer : t))
              : [...state.timers, nextTimer],
          };
        }),

      pauseTimer: (timerId) =>
        set((state) => ({
          timers: state.timers.map((t) => {
            if (t.id !== timerId || t.status !== 'running' || !t.endTime) return t;
            const remaining = Math.max(0, Math.ceil((t.endTime - Date.now()) / 1000));
            return {
              ...t,
              remainingSeconds: remaining,
              endTime: null,
              status: remaining === 0 ? 'finished' : 'paused',
            };
          }),
        })),

      resetTimer: (timerId) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === timerId
              ? {
                  ...t,
                  remainingSeconds: t.durationSeconds,
                  endTime: null,
                  status: 'idle',
                }
              : t,
          ),
        })),

      removeTimer: (timerId) =>
        set((state) => ({
          timers: state.timers.filter((t) => t.id !== timerId),
        })),

      markTimerFinished: (timerId) =>
        set((state) => ({
          timers: state.timers.map((t) =>
            t.id === timerId
              ? {
                  ...t,
                  remainingSeconds: 0,
                  endTime: null,
                  status: 'finished',
                }
              : t,
          ),
        })),
    }),
    {
      name: 'chefcard-cooking-v1',
    },
  ),
);
