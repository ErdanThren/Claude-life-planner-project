import { useState } from 'react';
import { AppSettings } from '../types';

const STORAGE_KEY = 'life-planner-settings';

const defaults: AppSettings = {
  anthropicApiKey: '',
  weightLossGoal: true,
  corefitnessGoal: true,
  dietaryPreferences: '',
};

function load(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(load);

  function updateSettings(partial: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { settings, updateSettings };
}
