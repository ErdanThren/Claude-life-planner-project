import React, { useState, useEffect } from 'react';
import { TimeBlock, BlockCategory } from '../types';

interface Props {
  initial?: Partial<TimeBlock>;
  onSave: (block: Omit<TimeBlock, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const CATEGORIES: { value: BlockCategory; label: string }[] = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'self-improvement', label: 'Self Improvement' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'preallocated', label: 'Pre-allocated' },
];

export default function BlockModal({ initial, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<BlockCategory>(initial?.category ?? 'personal');
  const [date, setDate] = useState(initial?.date ?? '');
  const [startTime, setStartTime] = useState(initial?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '10:00');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  useEffect(() => {
    if (initial) {
      setTitle(initial.title ?? '');
      setCategory(initial.category ?? 'personal');
      setDate(initial.date ?? '');
      setStartTime(initial.startTime ?? '09:00');
      setEndTime(initial.endTime ?? '10:00');
      setNotes(initial.notes ?? '');
    }
  }, [initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !title) return;
    onSave({ title, category, date, startTime, endTime, notes });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial?.id ? 'Edit Block' : 'Add Time Block'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Morning Run" />
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
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <div className="time-row">
            <label>
              Start
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>
            <label>
              End
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>
          </div>
          <label>
            Notes
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." />
          </label>
          <div className="modal-actions">
            {onDelete && (
              <button type="button" className="btn btn-danger" onClick={onDelete}>
                Delete
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
