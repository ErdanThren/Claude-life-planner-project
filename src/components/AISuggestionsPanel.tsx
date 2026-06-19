import React, { useState } from 'react';
import { TimeBlock, AppSettings } from '../types';
import { getExerciseSuggestions, getMealSuggestions } from '../utils/aiService';

interface Props {
  block: TimeBlock;
  settings: AppSettings;
  onClose: () => void;
}

function durationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export default function AISuggestionsPanel({ block, settings, onClose }: Props) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFitness = block.category === 'fitness';
  const isCooking = block.category === 'cooking';

  async function generate() {
    if (!settings.anthropicApiKey) {
      setError('Add your Anthropic API key in Settings to use AI suggestions.');
      return;
    }
    setLoading(true);
    setError('');
    setSuggestion('');
    try {
      if (isFitness) {
        const mins = durationMinutes(block.startTime, block.endTime);
        const text = await getExerciseSuggestions(
          settings.anthropicApiKey,
          { weightLoss: settings.weightLossGoal, coreFitness: settings.corefitnessGoal },
          mins > 0 ? mins : 45
        );
        setSuggestion(text);
      } else if (isCooking) {
        const text = await getMealSuggestions(
          settings.anthropicApiKey,
          { weightLoss: settings.weightLossGoal },
          settings.dietaryPreferences
        );
        setSuggestion(text);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to get suggestions. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  if (!isFitness && !isCooking) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ai-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isFitness ? '🏋️ Workout Suggestion' : '🍳 Meal Suggestion'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="ai-block-info">
          <strong>{block.title}</strong>
          <span>{block.date} · {block.startTime} – {block.endTime}</span>
        </div>

        {!suggestion && !loading && (
          <div className="ai-prompt-area">
            <p className="modal-subtitle">
              {isFitness
                ? `Get an AI-generated workout plan tailored to your ${durationMinutes(block.startTime, block.endTime)}-minute fitness slot.`
                : 'Get an AI-generated meal idea aligned with your health goals.'}
            </p>
            {error && <p className="ai-error">{error}</p>}
            <button className="btn btn-accent ai-generate-btn" onClick={generate}>
              ✨ Generate Suggestion
            </button>
          </div>
        )}

        {loading && (
          <div className="ai-loading">
            <div className="ai-spinner" />
            <p>Thinking up the perfect {isFitness ? 'workout' : 'meal'}…</p>
          </div>
        )}

        {suggestion && (
          <div className="ai-result">
            <pre className="ai-suggestion-text">{suggestion}</pre>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSuggestion('')}>
                Try Again
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
