import React, { useState } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  eachDayOfInterval,
} from 'date-fns';
import { TimeBlock, TodoItem, ViewMode } from './types';
import { useBlocks } from './hooks/useBlocks';
import { useSettings } from './hooks/useSettings';
import { useTodos } from './hooks/useTodos';
import { autoScheduleWeek } from './utils/autoSchedule';
import { isTodoActiveOnDate, isTodoCompletedOnDate } from './utils/todoUtils';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import TasksPanel from './components/TasksPanel';
import BlockModal from './components/BlockModal';
import AutoScheduleModal from './components/AutoScheduleModal';
import SettingsModal from './components/SettingsModal';
import AISuggestionsPanel from './components/AISuggestionsPanel';
import TodoModal from './components/TodoModal';
import Legend from './components/Legend';
import './App.css';

export default function App() {
  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingBlock, setEditingBlock] = useState<Partial<TimeBlock> | null>(null);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiBlock, setAiBlock] = useState<TimeBlock | null>(null);
  const [editingTodo, setEditingTodo] = useState<Partial<TodoItem> | null>(null);
  const [newTodoDate, setNewTodoDate] = useState<string | undefined>();

  const { blocks, addBlock, updateBlock, removeBlock, addBlocks, removeAutoScheduled } = useBlocks();
  const { settings, updateSettings } = useSettings();
  const { todos, addTodo, updateTodo, removeTodo, toggleComplete } = useTodos();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  function navigate(dir: 1 | -1) {
    if (view === 'week') {
      setCurrentDate((d) => (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
    } else {
      setCurrentDate((d) => (dir === 1 ? addMonths(d, 1) : subMonths(d, 1)));
    }
  }

  function getNavLabel() {
    if (view === 'week') {
      return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    return 'Tasks';
  }

  function handleDayClick(date: Date, hour = 9) {
    setEditingBlock({
      date: format(date, 'yyyy-MM-dd'),
      startTime: `${String(hour).padStart(2, '0')}:00`,
      endTime: `${String(hour + 1).padStart(2, '0')}:00`,
      category: 'personal',
    });
  }

  function handleBlockClick(block: TimeBlock) {
    if (block.category === 'fitness' || block.category === 'cooking') {
      setAiBlock(block);
    } else {
      setEditingBlock(block);
    }
  }

  function handleSaveBlock(data: Omit<TimeBlock, 'id'>) {
    if (editingBlock?.id) {
      updateBlock(editingBlock.id, data);
    } else {
      addBlock(data);
    }
    setEditingBlock(null);
  }

  function handleDeleteBlock() {
    if (editingBlock?.id) removeBlock(editingBlock.id);
    setEditingBlock(null);
  }

  function handleAutoSchedule(prefs: any) {
    removeAutoScheduled();
    const newBlocks = autoScheduleWeek(weekStart, weekEnd, blocks, prefs);
    addBlocks(newBlocks);
    setShowAutoModal(false);
  }

  function handleSaveTodo(data: Omit<TodoItem, 'id' | 'completedDates' | 'createdAt'>) {
    if (editingTodo?.id) {
      updateTodo(editingTodo.id, data);
    } else {
      addTodo(data);
    }
    setEditingTodo(null);
    setNewTodoDate(undefined);
  }

  function handleDeleteTodo() {
    if (editingTodo?.id) removeTodo(editingTodo.id);
    setEditingTodo(null);
    setNewTodoDate(undefined);
  }

  function openNewTodo(dateStr?: string) {
    setNewTodoDate(dateStr);
    setEditingTodo({});
  }

  const hasApiKey = !!settings.anthropicApiKey;
  const showNav = view !== 'tasks';
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const pendingTodayCount = todos.filter(
    (t) => isTodoActiveOnDate(t, todayStr) && !isTodoCompletedOnDate(t, todayStr)
  ).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Life Planner</h1>
          <p className="app-subtitle">Your personal wellness &amp; growth calendar</p>
        </div>
        <div className="header-right">
          <Legend />
          <button
            className={`btn btn-secondary settings-btn ${!hasApiKey ? 'settings-btn-alert' : ''}`}
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            ⚙ Settings{!hasApiKey && ' · AI'}
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="view-toggle">
          <button className={`toggle-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>
            Week
          </button>
          <button className={`toggle-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>
            Month
          </button>
          <button className={`toggle-btn ${view === 'tasks' ? 'active' : ''}`} onClick={() => setView('tasks')}>
            Tasks {pendingTodayCount > 0 && <span className="tab-badge">{pendingTodayCount}</span>}
          </button>
        </div>

        {showNav && (
          <div className="nav-controls">
            <button className="nav-btn" onClick={() => navigate(-1)}>‹</button>
            <span className="nav-label">{getNavLabel()}</span>
            <button className="nav-btn" onClick={() => navigate(1)}>›</button>
          </div>
        )}

        <div className="action-btns">
          {showNav && (
            <button className="btn btn-secondary" onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
          )}
          {view === 'week' && (
            <button className="btn btn-accent" onClick={() => setShowAutoModal(true)}>
              ⚡ Auto-Schedule
            </button>
          )}
          {view === 'tasks' ? (
            <button className="btn btn-primary" onClick={() => openNewTodo()}>
              + Add Task
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => handleDayClick(currentDate)}>
              + Add Block
            </button>
          )}
        </div>
      </div>

      <main className="calendar-area">
        {view === 'week' && (
          <WeekView
            weekDays={weekDays}
            blocks={blocks}
            todos={todos}
            onDayClick={handleDayClick}
            onBlockClick={handleBlockClick}
          />
        )}
        {view === 'month' && (
          <MonthView
            currentMonth={currentDate}
            blocks={blocks}
            onDayClick={handleDayClick}
            onBlockClick={handleBlockClick}
          />
        )}
        {view === 'tasks' && (
          <TasksPanel
            todos={todos}
            currentDate={currentDate}
            onToggle={toggleComplete}
            onEdit={(todo) => setEditingTodo(todo)}
            onAdd={() => openNewTodo()}
          />
        )}
      </main>

      {editingBlock !== null && (
        <BlockModal
          initial={editingBlock}
          onSave={handleSaveBlock}
          onDelete={editingBlock.id ? handleDeleteBlock : undefined}
          onClose={() => setEditingBlock(null)}
        />
      )}

      {showAutoModal && (
        <AutoScheduleModal
          weekLabel={getNavLabel()}
          onSchedule={handleAutoSchedule}
          onClose={() => setShowAutoModal(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {aiBlock && (
        <AISuggestionsPanel
          block={aiBlock}
          settings={settings}
          onClose={() => setAiBlock(null)}
        />
      )}

      {editingTodo !== null && (
        <TodoModal
          initial={editingTodo}
          defaultDate={newTodoDate}
          onSave={handleSaveTodo}
          onDelete={editingTodo.id ? handleDeleteTodo : undefined}
          onClose={() => { setEditingTodo(null); setNewTodoDate(undefined); }}
        />
      )}
    </div>
  );
}
