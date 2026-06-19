import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { TodoItem, BlockCategory } from '../types';
import { isTodoActiveOnDate, isTodoCompletedOnDate, DAY_NAMES } from '../utils/todoUtils';

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

const RECURRENCE_LABEL: Record<string, string> = {
  none: '',
  daily: 'Daily',
  weekly: 'Weekly',
  custom: 'Custom',
};

interface Props {
  todos: TodoItem[];
  currentDate: Date;
  onToggle: (id: string, dateStr: string) => void;
  onEdit: (todo: TodoItem) => void;
  onAdd: () => void;
}

type FilterMode = 'today' | 'week' | 'all';

export default function TasksPanel({ todos, currentDate, onToggle, onEdit, onAdd }: Props) {
  const [filter, setFilter] = useState<FilterMode>('today');
  const [categoryFilter, setCategoryFilter] = useState<BlockCategory | 'all'>('all');

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));

  function isVisible(todo: TodoItem): boolean {
    if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;
    if (filter === 'today') return isTodoActiveOnDate(todo, todayStr);
    if (filter === 'week') return weekDays.some((d) => isTodoActiveOnDate(todo, d));
    return true; // 'all'
  }

  const visible = todos.filter(isVisible);

  // Group by: pending first, then completed (for today/week views)
  const pending = visible.filter((t) => {
    if (filter === 'today') return !isTodoCompletedOnDate(t, todayStr);
    if (filter === 'week') return weekDays.some((d) => isTodoActiveOnDate(t, d) && !isTodoCompletedOnDate(t, d));
    return true;
  });
  const completed = visible.filter((t) => {
    if (filter === 'today') return isTodoCompletedOnDate(t, todayStr);
    if (filter === 'week') return weekDays.every((d) => !isTodoActiveOnDate(t, d) || isTodoCompletedOnDate(t, d));
    return false;
  });

  function recurrenceLabel(todo: TodoItem) {
    if (todo.recurrence === 'none') {
      return todo.dueDate ? `Due ${todo.dueDate}` : '';
    }
    if (todo.recurrence === 'weekly' || todo.recurrence === 'custom') {
      const days = (todo.recurrenceDays ?? []).map((d) => DAY_NAMES[d]).join(', ');
      return `${RECURRENCE_LABEL[todo.recurrence]} · ${days}`;
    }
    return RECURRENCE_LABEL[todo.recurrence];
  }

  function renderTodo(todo: TodoItem, dateStr: string, showDate?: boolean) {
    const done = isTodoCompletedOnDate(todo, dateStr);
    const color = CATEGORY_COLORS[todo.category];
    return (
      <div key={`${todo.id}-${dateStr}`} className={`todo-item ${done ? 'todo-done' : ''}`}>
        <button
          className={`todo-check ${done ? 'checked' : ''}`}
          onClick={() => onToggle(todo.id, dateStr)}
          style={{ borderColor: color }}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        >
          {done && <span style={{ color }}>✓</span>}
        </button>
        <div className="todo-body" onClick={() => onEdit(todo)}>
          <div className="todo-title-row">
            <span className="todo-title">{todo.title}</span>
            <span className="todo-category-dot" style={{ backgroundColor: color }} />
          </div>
          <div className="todo-meta">
            {showDate && <span>{dateStr}</span>}
            {todo.estimatedMinutes && <span>~{todo.estimatedMinutes}m</span>}
            {recurrenceLabel(todo) && <span className="recurrence-badge">{recurrenceLabel(todo)}</span>}
            {todo.notes && <span className="todo-note-hint" title={todo.notes}>📝</span>}
          </div>
        </div>
      </div>
    );
  }

  // For week view, render per-day sections
  function renderWeekView() {
    return (
      <div className="tasks-week">
        {weekDays.map((dateStr) => {
          const dayTodos = todos.filter(
            (t) => isTodoActiveOnDate(t, dateStr) && (categoryFilter === 'all' || t.category === categoryFilter)
          );
          if (dayTodos.length === 0) return null;
          const pendingDay = dayTodos.filter((t) => !isTodoCompletedOnDate(t, dateStr));
          const doneDay = dayTodos.filter((t) => isTodoCompletedOnDate(t, dateStr));
          const label = dateStr === todayStr ? 'Today' : format(new Date(dateStr + 'T12:00:00'), 'EEE, MMM d');
          return (
            <div key={dateStr} className="tasks-day-section">
              <div className="tasks-day-header">
                <span>{label}</span>
                <span className="tasks-day-count">
                  {doneDay.length}/{dayTodos.length} done
                </span>
              </div>
              {pendingDay.map((t) => renderTodo(t, dateStr))}
              {doneDay.map((t) => renderTodo(t, dateStr))}
            </div>
          );
        })}
        {weekDays.every((d) =>
          todos.filter((t) => isTodoActiveOnDate(t, d)).length === 0
        ) && <EmptyState onAdd={onAdd} />}
      </div>
    );
  }

  return (
    <div className="tasks-panel">
      {/* Filter bar */}
      <div className="tasks-toolbar">
        <div className="view-toggle">
          {(['today', 'week', 'all'] as FilterMode[]).map((f) => (
            <button
              key={f}
              className={`toggle-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'All Tasks'}
            </button>
          ))}
        </div>
        <select
          className="category-filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as BlockCategory | 'all')}
        >
          <option value="all">All categories</option>
          <option value="chores">Chores</option>
          <option value="fitness">Fitness</option>
          <option value="cooking">Cooking</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="self-improvement">Self Improvement</option>
          <option value="free-time">Free Time</option>
        </select>
        <button className="btn btn-primary" onClick={onAdd}>+ Add Task</button>
      </div>

      <div className="tasks-content">
        {filter === 'week' ? (
          renderWeekView()
        ) : (
          <>
            {pending.length === 0 && completed.length === 0 && <EmptyState onAdd={onAdd} />}

            {pending.length > 0 && (
              <div className="tasks-section">
                <div className="tasks-section-header">
                  Pending <span className="tasks-count">{pending.length}</span>
                </div>
                {pending.map((t) => renderTodo(t, todayStr, filter === 'all'))}
              </div>
            )}

            {completed.length > 0 && filter === 'today' && (
              <div className="tasks-section tasks-section-done">
                <div className="tasks-section-header">
                  Completed today <span className="tasks-count">{completed.length}</span>
                </div>
                {completed.map((t) => renderTodo(t, todayStr))}
              </div>
            )}

            {filter === 'all' && (
              <div className="tasks-section">
                <div className="tasks-section-header">
                  All tasks <span className="tasks-count">{visible.length}</span>
                </div>
                {visible.map((t) => renderTodo(t, todayStr, true))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="tasks-empty">
      <p>No tasks here yet.</p>
      <button className="btn btn-primary" onClick={onAdd}>+ Add your first task</button>
    </div>
  );
}
