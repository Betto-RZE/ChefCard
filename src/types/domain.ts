export type Difficulty = 'Fácil' | 'Media' | 'Avanzada';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  order: number;
  title: string;
  instruction: string;
  timerSeconds?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  cookbookSlug: string;
  title: string;
  description: string;
  prepMinutes: number;
  cookMinutes: number;
  defaultServings: number;
  difficulty: Difficulty;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

export interface Cookbook {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentBg: string;
  emoji: string;
}

export interface CardMapping {
  uid: string;
  cookbookSlug: string;
  customLabel?: string;
  updatedAt: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface ActiveTimer {
  id: string;
  recipeId: string;
  stepOrder: number;
  label: string;
  durationSeconds: number;
  remainingSeconds: number;
  endTime: number | null;
  status: TimerStatus;
}
