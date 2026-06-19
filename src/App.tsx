import React, { useState, useCallback } from 'react';
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
import { TimeBlock, ViewMode } from './types';
import { useBlocks } from './hooks/useBlocks';
import { autoScheduleWeek } from './utils/autoSchedule';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import BlockModal from './components/BlockModal';
import AutoScheduleModal from './components/AutoScheduleModal';
import Legend from './components/Legend';
import './App.css';

export default function App() {
  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingBlock, setEditingBlock] = useState<Partial<TimeBlock> | null>(null);
  const [showAutoModal, setShowAutoModal] = useState(false);

  const { blocks, addBlock, updateBlock, removeBlock, addBlocks, removeAutoScheduled } = useBlocks();

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
    return format(currentDate, 'MMMM yyyy');
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
    setEditingBlock(block);
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
    if (editingBlock?.id) {
      removeBlock(editingBlock.id);
    }
    setEditingBlock(null);
  }

  function handleAutoSchedule(prefs: any) {
    removeAutoScheduled();
    const newBlocks = autoScheduleWeek(weekStart, weekEnd, blocks, prefs);
    addBlocks(newBlocks);
    setShowAutoModal(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Life Planner</h1>
          <p className="app-subtitle">Your personal wellness &amp; growth calendar</p>
        </div>
        <div className="header-right">
          <Legend />
        </div>
      </header>

      <div className="toolbar">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </button>
          <button
            className={`toggle-btn ${view === 'month' ? 'active' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </button>
        </div>

        <div className="nav-controls">
          <button className="nav-btn" onClick={() => navigate(-1)}>‹</button>
          <span className="nav-label">{getNavLabel()}</span>
          <button className="nav-btn" onClick={() => navigate(1)}>›</button>
        </div>

        <div className="action-btns">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
          {view === 'week' && (
            <button
              className="btn btn-accent"
              onClick={() => setShowAutoModal(true)}
            >
              ⚡ Auto-Schedule
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => handleDayClick(currentDate)}
          >
            + Add Block
          </button>
        </div>
      </div>

      <main className="calendar-area">
        {view === 'week' ? (
          <WeekView
            weekDays={weekDays}
            blocks={blocks}
            onDayClick={handleDayClick}
            onBlockClick={handleBlockClick}
          />
        ) : (
          <MonthView
            currentMonth={currentDate}
            blocks={blocks}
            onDayClick={handleDayClick}
            onBlockClick={handleBlockClick}
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
    </div>
  );
}
