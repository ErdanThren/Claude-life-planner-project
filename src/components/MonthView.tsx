import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from 'date-fns';
import { TimeBlock, BlockCategory } from '../types';

const CATEGORY_COLORS: Record<BlockCategory, string> = {
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

interface Props {
  currentMonth: Date;
  blocks: TimeBlock[];
  onDayClick: (date: Date) => void;
  onBlockClick: (block: TimeBlock) => void;
}

export default function MonthView({ currentMonth, blocks, onDayClick, onBlockClick }: Props) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="month-view">
      <div className="month-day-names">
        {dayNames.map((d) => <div key={d} className="month-day-name">{d}</div>)}
      </div>
      <div className="month-grid">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBlocks = blocks.filter((b) => b.date === dateStr);
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={dateStr}
              className={`month-cell ${!inMonth ? 'out-of-month' : ''} ${isToday(day) ? 'today-cell' : ''}`}
              onClick={() => onDayClick(day)}
            >
              <span className="month-cell-num">{format(day, 'd')}</span>
              <div className="month-cell-blocks">
                {dayBlocks.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="month-block-pill"
                    style={{ backgroundColor: CATEGORY_COLORS[b.category] }}
                    onClick={(e) => { e.stopPropagation(); onBlockClick(b); }}
                    title={`${b.title} ${b.startTime}–${b.endTime}`}
                  >
                    {b.title}
                  </div>
                ))}
                {dayBlocks.length > 3 && (
                  <div className="month-more">+{dayBlocks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
