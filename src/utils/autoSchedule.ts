import { v4 as uuidv4 } from 'uuid';
import { TimeBlock, AutoSchedulePrefs, BlockCategory } from '../types';
import { getFreeSlots, findFirstFit, formatTime, parseTime } from './timeUtils';
import { format, eachDayOfInterval } from 'date-fns';

interface ScheduleItem {
  category: BlockCategory;
  duration: number;
  title: string;
}

export function autoScheduleWeek(
  weekStart: Date,
  weekEnd: Date,
  existingBlocks: TimeBlock[],
  prefs: AutoSchedulePrefs
): TimeBlock[] {
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const newBlocks: TimeBlock[] = [];
  const startBound = prefs.preferredStartHour * 60;
  const endBound = prefs.preferredEndHour * 60;

  let altIndex = 0;

  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const allBlocks = [...existingBlocks, ...newBlocks];

    // Add sleep block first if configured
    const sleepStartMins = parseTime(prefs.sleepEnd); // wake-up = day start
    const sleepEndMins = parseTime(prefs.sleepStart); // bedtime = day end
    const effectiveStart = Math.max(startBound, sleepStartMins);
    const effectiveEnd = Math.min(endBound, sleepEndMins > 0 ? sleepEndMins : endBound);

    const freeSlots = getFreeSlots(dateStr, allBlocks, effectiveStart, effectiveEnd);

    const toSchedule: ScheduleItem[] = [];

    // Fitness / self-improvement
    if (prefs.mode === 'separate') {
      if (prefs.fitnessDuration > 0)
        toSchedule.push({ category: 'fitness', duration: prefs.fitnessDuration, title: 'Fitness' });
      if (prefs.selfImprovementDuration > 0)
        toSchedule.push({ category: 'self-improvement', duration: prefs.selfImprovementDuration, title: 'Self Improvement' });
    } else {
      if (altIndex % 2 === 0 && prefs.fitnessDuration > 0) {
        toSchedule.push({ category: 'fitness', duration: prefs.fitnessDuration, title: 'Fitness' });
      } else if (prefs.selfImprovementDuration > 0) {
        toSchedule.push({ category: 'self-improvement', duration: prefs.selfImprovementDuration, title: 'Self Improvement' });
      }
      altIndex++;
    }

    // Chores, cooking, free time
    if (prefs.choresDuration > 0)
      toSchedule.push({ category: 'chores', duration: prefs.choresDuration, title: 'Chores' });
    if (prefs.cookingDuration > 0)
      toSchedule.push({ category: 'cooking', duration: prefs.cookingDuration, title: 'Cooking' });
    if (prefs.freeTimeDuration > 0)
      toSchedule.push({ category: 'free-time', duration: prefs.freeTimeDuration, title: 'Free Time' });

    // Sleep block
    if (prefs.sleepStart && prefs.sleepEnd) {
      const bedtimeMins = parseTime(prefs.sleepStart);
      const wakeupMins = parseTime(prefs.sleepEnd);
      if (bedtimeMins > 0) {
        newBlocks.push({
          id: uuidv4(),
          title: 'Sleep',
          category: 'sleep',
          date: dateStr,
          startTime: prefs.sleepStart,
          endTime: '23:59',
          isAutoScheduled: true,
        });
      }
      if (wakeupMins > 0 && wakeupMins > startBound) {
        newBlocks.push({
          id: uuidv4(),
          title: 'Sleep',
          category: 'sleep',
          date: dateStr,
          startTime: `${String(prefs.preferredStartHour).padStart(2, '0')}:00`,
          endTime: prefs.sleepEnd,
          isAutoScheduled: true,
        });
      }
    }

    let remainingSlots = [...freeSlots];

    for (const item of toSchedule) {
      const fit = findFirstFit(remainingSlots, item.duration);
      if (fit) {
        newBlocks.push({
          id: uuidv4(),
          title: item.title,
          category: item.category,
          date: dateStr,
          startTime: formatTime(fit.start),
          endTime: formatTime(fit.end),
          isAutoScheduled: true,
        });
        remainingSlots = remainingSlots.flatMap((s) => {
          if (s.start === fit.start && s.end >= fit.end) {
            const leftover = { start: fit.end, end: s.end };
            return leftover.end > leftover.start ? [leftover] : [];
          }
          return [s];
        });
      }
    }
  }

  return newBlocks;
}
