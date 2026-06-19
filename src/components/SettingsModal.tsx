import React, { useState } from 'react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.anthropicApiKey);
  const [weightLoss, setWeightLoss] = useState(settings.weightLossGoal);
  const [coreFitness, setCoreFitness] = useState(settings.corefitnessGoal);
  const [diet, setDiet] = useState(settings.dietaryPreferences);
  const [showKey, setShowKey] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      anthropicApiKey: apiKey.trim(),
      weightLossGoal: weightLoss,
      corefitnessGoal: coreFitness,
      dietaryPreferences: diet.trim(),
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave} className="modal-form">
          <p className="modal-subtitle">Configure AI features and personal goals.</p>

          <label>
            Anthropic API Key
            <div className="input-row">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowKey((v) => !v)}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <span className="field-hint">Required for AI workout &amp; meal suggestions. Stored locally only.</span>
          </label>

          <div className="settings-section-title">Goals</div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={weightLoss}
              onChange={(e) => setWeightLoss(e.target.checked)}
            />
            Weight Loss
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={coreFitness}
              onChange={(e) => setCoreFitness(e.target.checked)}
            />
            Core Fitness Improvement
          </label>

          <label>
            Dietary Preferences / Restrictions
            <input
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="e.g. vegetarian, gluten-free, no dairy..."
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
