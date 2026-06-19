const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

async function callClaude(apiKey: string, userMessage: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();
  return (data.content as any[])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('\n');
}

export async function getExerciseSuggestions(
  apiKey: string,
  goals: { weightLoss: boolean; coreFitness: boolean },
  durationMinutes: number
): Promise<string> {
  const goalText = [
    goals.weightLoss && 'weight loss',
    goals.coreFitness && 'core fitness / strength',
  ]
    .filter(Boolean)
    .join(' and ');

  return callClaude(
    apiKey,
    `I have a ${durationMinutes}-minute fitness slot. My goals are ${goalText || 'general fitness'}. Give me a specific, motivating workout plan for this session. Include warm-up, main exercises with sets/reps or duration, and cool-down. Format clearly with sections. Keep it practical and achievable.`
  );
}

export async function getMealSuggestions(
  apiKey: string,
  goals: { weightLoss: boolean },
  dietaryPreferences: string
): Promise<string> {
  const dietNote = dietaryPreferences ? ` Dietary preferences/restrictions: ${dietaryPreferences}.` : '';
  return callClaude(
    apiKey,
    `Suggest a healthy meal or recipe for someone${goals.weightLoss ? ' focused on weight loss' : ''}.${dietNote} Provide: meal name, approximate calories, ingredients list, and simple cooking steps. Make it delicious, nutritious, and easy to prepare.`
  );
}
