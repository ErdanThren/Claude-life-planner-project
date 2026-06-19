import React, { useState, useEffect } from 'react';
import { TodoItem, BlockCategory, RecurrenceType } from '../types';
import { DAY_NAMES } from '../utils/todoUtils';
import { format } from 'date-fns';

interface Props {
  initial?: Partial<TodoItem>;
  defaultDate?: string;
  onSave: (todo: Omit<TodoItem, 'id' | 'completedDates' | 'createdAt'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const CATEGORIES: { value: BlockCategory; label: string }[] = [
  { value: 'chores', label: 'Chores' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'self-improvement', label: 'Self Improvement' },
  { value: 'free-time', label: 'Free Time' },
];

export default function TodoModal({ initial, defaultDate, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<BlockCategory>(initial?.category ?? 'chores');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(initial?.estimatedMinutes ?? 30);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(initial?.recurrence ?? 'none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(initial?.recurrenceDays ?? []);
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? defaultDate ?? format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '');
      setCategory(initial.category ?? 'chores');
      setNotes(initial.notes ?? '');
      setEstimatedMinutes(initial.estimatedMinutes ?? 30);
      setRecurrence(initial.recurrence ?? 'none');
      setRecurrenceDays(initial.recurrenceDays ?? []);
      setDueDate(initial.dueDate ?? defaultDate ?? format(new Date(), 'yyyy-MM-dd'));
    }
  }, [initial, defaultDate]);

  function toggleDay(day: number) {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // When switching to weekly preset to current day if none selected
  function handleRecurrenceChange(r: RecurrenceType) {
    setRecurrence(r);
    if (r === 'weekly' && recurrenceDays.length === 0) {
      const today = new Date().getDay();
      const mapped = today === 0 ? 6 : today - 1;
      setRecurrenceDays([mapped]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      category,
      notes: notes.trim() || undefined,
      estimatedMinutes,
      recurrence,
      recurrenceDays: recurrence !== 'none' ? recurrenceDays : undefined,
      dueDate: recurrence === 'none' ? dueDate : undefined,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial?.id ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Vacuum living room"
              autoFocus
            />
          </label>

          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as BlockCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>

          <label>
            Estimated time (minutes)
            <input
              type="number"
              min={5}
              max={480}
              step={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(+e.target.value)}
            />
          </label>

          <label>
            Recurrence
            <select value={recurrence} onChange={(e) => handleRecurrenceChange(e.target.value as RecurrenceType)}>
              <option value="none">One-off (no repeat)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (specific day)</option>
              <option value="custom">Custom days</option>
            </select>
          </label>

          {recurrence === 'none' && (
            <label>
              Due Date
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </label>
          )}

          {(recurrence === 'weekly' || recurrence === 'custom') && (
            <div>
              <div className="settings-section-title" style={{ marginBottom: 8 }}>
                {recurrence === 'weekly' ? 'Day of week' : 'Active days'}
              </div>
              <div className="day-picker">
                {DAY_NAMES.map((name, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`day-btn ${recurrenceDays.includes(i) ? 'active' : ''}`}
                    onClick={() => toggleDay(i)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes or instructions..."
            />
          </label>

          <div className="modal-actions">
            {onDelete && (
              <button type="button" className="btn btn-danger" onClick={onDelete}>Delete</button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
