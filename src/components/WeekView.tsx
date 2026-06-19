import React from 'react';
import { format, isToday } from 'date-fns';
import { TimeBlock, TodoItem } from '../types';
import TimeBlockChip from './TimeBlockChip';
import { getPendingTodosForDate } from '../utils/todoUtils';

const DAY_START_H = 6;
const DAY_END_H = 23;
const HOUR_COUNT = DAY_END_H - DAY_START_H;

interface Props {
  weekDays: Date[];
  blocks: TimeBlock[];
  todos: TodoItem[];
  onDayClick: (date: Date, hour: number) => void;
  onBlockClick: (block: TimeBlock) => void;
}

export default function WeekView({ weekDays, blocks, todos, onDayClick, onBlockClick }: Props) {
  const hours = Array.from({ length: HOUR_COUNT }, (_, i) => DAY_START_H + i);

  function handleColumnClick(day: Date, e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const fraction = y / rect.height;
    const hour = Math.floor(DAY_START_H + fraction * HOUR_COUNT);
    onDayClick(day, hour);
  }

  return (
    <div className="week-view">
      {/* Header row */}
      <div className="week-header">
        <div className="time-gutter" />
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const pendingCount = getPendingTodosForDate(todos, dateStr).length;
          return (
            <div key={day.toISOString()} className={`day-header ${isToday(day) ? 'today' : ''}`}>
              <span className="day-name">{format(day, 'EEE')}</span>
              <span className="day-num">{format(day, 'd')}</span>
              {pendingCount > 0 && (
                <span className="day-task-badge" title={`${pendingCount} pending task${pendingCount > 1 ? 's' : ''}`}>
                  {pendingCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="week-grid">
        {/* Time labels */}
        <div className="time-gutter">
          {hours.map((h) => (
            <div key={h} className="hour-label">
              {format(new Date(2000, 0, 1, h), 'ha')}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayBlocks = blocks.filter((b) => b.date === dateStr);

          return (
            <div
              key={dateStr}
              className={`day-column ${isToday(day) ? 'today-col' : ''}`}
              onClick={(e) => handleColumnClick(day, e)}
            >
              {/* Hour lines */}
              {hours.map((h) => (
                <div key={h} className="hour-line" style={{ top: `${((h - DAY_START_H) / HOUR_COUNT) * 100}%` }} />
              ))}
              {/* Blocks */}
              {dayBlocks.map((block) => (
                <TimeBlockChip
                  key={block.id}
                  block={block}
                  dayStartH={DAY_START_H}
                  dayEndH={DAY_END_H}
                  onClick={onBlockClick}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
