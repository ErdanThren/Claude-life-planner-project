import { TodoItem } from '../types';
import { parseISO, getDay, format } from 'date-fns';

// Returns true if a todo is relevant (due/active) on a given date string
export function isTodoActiveOnDate(todo: TodoItem, dateStr: string): boolean {
  const date = parseISO(dateStr);
  // 0=Sun in JS, we use 0=Mon internally → convert
  const jsDay = getDay(date); // 0=Sun
  const day = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon…6=Sun

  switch (todo.recurrence) {
    case 'daily':
      return true;
    case 'weekly':
      return !!(todo.recurrenceDays && todo.recurrenceDays.includes(day));
    case 'custom':
      return !!(todo.recurrenceDays && todo.recurrenceDays.includes(day));
    case 'none':
      return todo.dueDate === dateStr;
    default:
      return false;
  }
}

export function isTodoCompletedOnDate(todo: TodoItem, dateStr: string): boolean {
  return todo.completedDates.includes(dateStr);
}

// Todos active today that aren't completed
export function getPendingTodosForDate(todos: TodoItem[], dateStr: string): TodoItem[] {
  return todos.filter(
    (t) => isTodoActiveOnDate(t, dateStr) && !isTodoCompletedOnDate(t, dateStr)
  );
}

export function getTodosForDate(todos: TodoItem[], dateStr: string): TodoItem[] {
  return todos.filter((t) => isTodoActiveOnDate(t, dateStr));
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
