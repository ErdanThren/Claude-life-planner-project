import React from 'react';

const items = [
  { label: 'Fitness', color: '#22c55e' },
  { label: 'Self Improvement', color: '#a855f7' },
  { label: 'Work', color: '#3b82f6' },
  { label: 'Personal', color: '#f59e0b' },
  { label: 'Pre-allocated', color: '#6b7280' },
];

export default function Legend() {
  return (
    <div className="legend">
      {items.map((item) => (
        <div key={item.label} className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: item.color }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
