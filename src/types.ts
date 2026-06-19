export type BlockCategory =
  | 'fitness'
  | 'self-improvement'
  | 'work'
  | 'chores'
  | 'cooking'
  | 'free-time'
  | 'sleep'
  | 'personal'
  | 'preallocated';

export interface TimeBlock {
  id: string;
  title: string;
  category: BlockCategory;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  notes?: string;
  isAutoScheduled?: boolean;
}

export type ViewMode = 'week' | 'month';

export interface AutoSchedulePrefs {
  fitnessDuration: number; // minutes
  selfImprovementDuration: number; // minutes
  choresDuration: number; // minutes
  cookingDuration: number; // minutes
  freeTimeDuration: number; // minutes
  sleepStart: string; // HH:MM
  sleepEnd: string; // HH:MM
  mode: 'separate' | 'alternate';
  preferredStartHour: number;
  preferredEndHour: number;
}

export interface AppSettings {
  anthropicApiKey: string;
  weightLossGoal: boolean;
  corefitnessGoal: boolean;
  dietaryPreferences: string;
}
