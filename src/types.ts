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

export type ViewMode = 'week' | 'month' | 'tasks';

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

// ── Todo / Recurring Chores ──────────────────────

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'custom';

export interface TodoItem {
  id: string;
  title: string;
  category: BlockCategory;
  notes?: string;
  estimatedMinutes?: number;
  // Recurrence
  recurrence: RecurrenceType;
  recurrenceDays?: number[]; // 0=Mon…6=Sun for 'weekly' and 'custom'
  dueDate?: string; // YYYY-MM-DD for non-recurring one-offs
  // Completion: set of YYYY-MM-DD dates on which this was ticked
  completedDates: string[];
  createdAt: string; // ISO timestamp
}

