import { TimeBlock } from '../types';

export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function blockDurationMinutes(block: TimeBlock): number {
  return parseTime(block.endTime) - parseTime(block.startTime);
}

/** Returns free slots on a given date, bounded by [startHour*60, endHour*60] */
export function getFreeSlots(
  date: string,
  blocks: TimeBlock[],
  startBound: number,
  endBound: number
): Array<{ start: number; end: number }> {
  const dayBlocks = blocks
    .filter((b) => b.date === date)
    .map((b) => ({ start: parseTime(b.startTime), end: parseTime(b.endTime) }))
    .sort((a, b) => a.start - b.start);

  const slots: Array<{ start: number; end: number }> = [];
  let cursor = startBound;

  for (const blk of dayBlocks) {
    if (blk.start > cursor) {
      slots.push({ start: cursor, end: blk.start });
    }
    cursor = Math.max(cursor, blk.end);
  }

  if (cursor < endBound) {
    slots.push({ start: cursor, end: endBound });
  }

  return slots;
}

/** Find first slot of at least `duration` minutes */
export function findFirstFit(
  slots: Array<{ start: number; end: number }>,
  duration: number
): { start: number; end: number } | null {
  for (const slot of slots) {
    if (slot.end - slot.start >= duration) {
      return { start: slot.start, end: slot.start + duration };
    }
  }
  return null;
}

export function timeToPercent(hhmm: string, dayStartH = 6, dayEndH = 23): number {
  const mins = parseTime(hhmm);
  const start = dayStartH * 60;
  const end = dayEndH * 60;
  return ((mins - start) / (end - start)) * 100;
}
