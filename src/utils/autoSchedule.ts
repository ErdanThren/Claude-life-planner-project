import { v4 as uuidv4 } from 'uuid';
import { TimeBlock, AutoSchedulePrefs, BlockCategory } from '../types';
import { getFreeSlots, findFirstFit, formatTime } from './timeUtils';
import { format, eachDayOfInterval } from 'date-fns';

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

  let altIndex = 0; // for alternating mode

  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const allBlocks = [...existingBlocks, ...newBlocks];
    const freeSlots = getFreeSlots(dateStr, allBlocks, startBound, endBound);

    const toSchedule: Array<{ category: BlockCategory; duration: number; title: string }> = [];

    if (prefs.mode === 'separate') {
      toSchedule.push({ category: 'fitness', duration: prefs.fitnessDuration, title: 'Fitness' });
      toSchedule.push({ category: 'self-improvement', duration: prefs.selfImprovementDuration, title: 'Self Improvement' });
    } else {
      // alternate day by day
      if (altIndex % 2 === 0) {
        toSchedule.push({ category: 'fitness', duration: prefs.fitnessDuration, title: 'Fitness' });
      } else {
        toSchedule.push({ category: 'self-improvement', duration: prefs.selfImprovementDuration, title: 'Self Improvement' });
      }
      altIndex++;
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
        // Trim the used slot from remainingSlots
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
