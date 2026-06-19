export type BlockCategory = 'fitness' | 'self-improvement' | 'work' | 'personal' | 'preallocated';

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
  mode: 'separate' | 'alternate'; // schedule both or alternate
  preferredStartHour: number; // e.g. 6 for 6am
  preferredEndHour: number; // e.g. 22 for 10pm
}
