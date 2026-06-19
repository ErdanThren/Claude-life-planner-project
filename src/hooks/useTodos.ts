import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TodoItem } from '../types';

const STORAGE_KEY = 'life-planner-todos';

function load(): TodoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: TodoItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>(load);

  const persist = useCallback((updated: TodoItem[]) => {
    setTodos(updated);
    save(updated);
  }, []);

  const addTodo = useCallback(
    (todo: Omit<TodoItem, 'id' | 'completedDates' | 'createdAt'>) => {
      const item: TodoItem = {
        ...todo,
        id: uuidv4(),
        completedDates: [],
        createdAt: new Date().toISOString(),
      };
      persist([...todos, item]);
      return item;
    },
    [todos, persist]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<TodoItem>) => {
      persist(todos.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    },
    [todos, persist]
  );

  const removeTodo = useCallback(
    (id: string) => {
      persist(todos.filter((t) => t.id !== id));
    },
    [todos, persist]
  );

  const toggleComplete = useCallback(
    (id: string, dateStr: string) => {
      persist(
        todos.map((t) => {
          if (t.id !== id) return t;
          const already = t.completedDates.includes(dateStr);
          return {
            ...t,
            completedDates: already
              ? t.completedDates.filter((d) => d !== dateStr)
              : [...t.completedDates, dateStr],
          };
        })
      );
    },
    [todos, persist]
  );

  return { todos, addTodo, updateTodo, removeTodo, toggleComplete };
}
