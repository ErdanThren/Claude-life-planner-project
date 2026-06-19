import React, { useState } from 'react';
import { AutoSchedulePrefs } from '../types';

interface Props {
  weekLabel: string;
  onSchedule: (prefs: AutoSchedulePrefs) => void;
  onClose: () => void;
}

export default function AutoScheduleModal({ weekLabel, onSchedule, onClose }: Props) {
  const [mode, setMode] = useState<'separate' | 'alternate'>('separate');
  const [fitnessDuration, setFitnessDuration] = useState(45);
  const [selfDuration, setSelfDuration] = useState(45);
  const [choresDuration, setChoresDuration] = useState(30);
  const [cookingDuration, setCookingDuration] = useState(45);
  const [freeTimeDuration, setFreeTimeDuration] = useState(60);
  const [sleepStart, setSleepStart] = useState('22:30');
  const [sleepEnd, setSleepEnd] = useState('06:30');
  const [startHour, setStartHour] = useState(6);
  const [endHour, setEndHour] = useState(22);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSchedule({
      mode,
      fitnessDuration,
      selfImprovementDuration: selfDuration,
      choresDuration,
      cookingDuration,
      freeTimeDuration,
      sleepStart,
      sleepEnd,
      preferredStartHour: startHour,
      preferredEndHour: endHour,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Auto-Schedule Week</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <p className="modal-subtitle">Filling in free time for <strong>{weekLabel}</strong></p>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Fitness/Self Improvement Mode
            <select value={mode} onChange={(e) => setMode(e.target.value as 'separate' | 'alternate')}>
              <option value="separate">Both daily (fitness + self improvement each day)</option>
              <option value="alternate">Alternate (fitness one day, self improvement next)</option>
            </select>
          </label>

          <div className="settings-section-title">Durations (minutes)</div>
          <div className="duration-grid">
            <label>
              Fitness
              <input type="number" min={0} max={120} step={5} value={fitnessDuration} onChange={(e) => setFitnessDuration(+e.target.value)} />
            </label>
            <label>
              Self Improvement
              <input type="number" min={0} max={120} step={5} value={selfDuration} onChange={(e) => setSelfDuration(+e.target.value)} />
            </label>
            <label>
              Chores
              <input type="number" min={0} max={120} step={5} value={choresDuration} onChange={(e) => setChoresDuration(+e.target.value)} />
            </label>
            <label>
              Cooking
              <input type="number" min={0} max={120} step={5} value={cookingDuration} onChange={(e) => setCookingDuration(+e.target.value)} />
            </label>
            <label>
              Free Time
              <input type="number" min={0} max={180} step={15} value={freeTimeDuration} onChange={(e) => setFreeTimeDuration(+e.target.value)} />
            </label>
          </div>

          <div className="settings-section-title">Sleep Schedule</div>
          <div className="time-row">
            <label>
              Bedtime
              <input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
            </label>
            <label>
              Wake Up
              <input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />
            </label>
          </div>

          <div className="settings-section-title">Scheduling Window</div>
          <div className="time-row">
            <label>
              Earliest hour
              <input type="number" min={0} max={12} value={startHour} onChange={(e) => setStartHour(+e.target.value)} />
            </label>
            <label>
              Latest hour
              <input type="number" min={12} max={24} value={endHour} onChange={(e) => setEndHour(+e.target.value)} />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Auto-Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}
