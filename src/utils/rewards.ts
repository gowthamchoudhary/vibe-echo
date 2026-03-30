export interface VibeTitle {
  title: string;
  description: string;
  minScore: number;
  color: string;
}

export const VIBE_TITLES: VibeTitle[] = [
  { title: 'Static Noise', description: 'The connection was… fuzzy', minScore: 0, color: '#666666' },
  { title: 'Chaos Engine', description: 'Unpredictable energy detected', minScore: 20, color: '#ff4444' },
  { title: 'Vibe Drifter', description: 'Floating through frequencies', minScore: 35, color: '#4488ff' },
  { title: 'Frequency Rider', description: 'Riding the wave', minScore: 50, color: '#00f5ff' },
  { title: 'Synced Soul', description: 'You felt the connection', minScore: 65, color: '#9b59ff' },
  { title: 'Unhinged Frequency', description: 'Beyond normal vibrations', minScore: 80, color: '#ff6b00' },
  { title: 'Legendary Resonance', description: 'Two souls, one frequency', minScore: 90, color: '#ffd700' },
];

export function getVibeTitle(score: number): VibeTitle {
  let result = VIBE_TITLES[0];
  for (const t of VIBE_TITLES) {
    if (score >= t.minScore) result = t;
  }
  return result;
}

export type AuraEffect = 'none' | 'glow_upgrade' | 'rainbow' | 'fire' | 'electric';

export function getUnlockedEffects(score: number, combo: number): AuraEffect[] {
  const effects: AuraEffect[] = [];
  if (score >= 30) effects.push('glow_upgrade');
  if (score >= 60) effects.push('electric');
  if (combo >= 5) effects.push('fire');
  if (score >= 85) effects.push('rainbow');
  return effects;
}
