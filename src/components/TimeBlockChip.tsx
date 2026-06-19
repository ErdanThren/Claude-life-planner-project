import React from 'react';
import { TimeBlock } from '../types';
import { timeToPercent } from '../utils/timeUtils';

interface Props {
  block: TimeBlock;
  dayStartH?: number;
  dayEndH?: number;
  onClick: (block: TimeBlock) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  fitness: '#22c55e',
  'self-improvement': '#a855f7',
  work: '#3b82f6',
  chores: '#f97316',
  cooking: '#ec4899',
  'free-time': '#06b6d4',
  sleep: '#1d4ed8',
  personal: '#f59e0b',
  preallocated: '#6b7280',
};

export default function TimeBlockChip({ block, dayStartH = 6, dayEndH = 23, onClick }: Props) {
  const top = timeToPercent(block.startTime, dayStartH, dayEndH);
  const bottom = timeToPercent(block.endTime, dayStartH, dayEndH);
  const height = bottom - top;
  const color = CATEGORY_COLORS[block.category] ?? '#64748b';

  return (
    <div
      className="time-block-chip"
      style={{
        top: `${top}%`,
        height: `${Math.max(height, 2)}%`,
        backgroundColor: color,
        borderLeft: `3px solid ${color}`,
      }}
      onClick={(e) => { e.stopPropagation(); onClick(block); }}
      title={`${block.title}\n${block.startTime} – ${block.endTime}`}
    >
      <span className="chip-title">{block.title}</span>
      {height > 4 && (
        <span className="chip-time">{block.startTime} – {block.endTime}</span>
      )}
    </div>
  );
}
