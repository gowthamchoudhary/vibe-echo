export function getVibeLabel(score: number): string {
  if (score <= 30) return 'Parallel universe strangers';
  if (score <= 50) return 'Chaotic but interesting';
  if (score <= 70) return 'Unexpectedly compatible';
  if (score <= 85) return 'Pure unhinged frequency';
  return 'LEGENDARY VIBE ACHIEVED';
}

export function getRandomVibeIncrease(): number {
  return Math.floor(Math.random() * 8) + 8; // 8-15
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 4;
  if (combo >= 7) return 3;
  if (combo >= 3) return 2;
  return 1;
}

export function getScoreWithCombo(base: number, combo: number): number {
  return base * getComboMultiplier(combo);
}

export function getIntensityMultiplier(timeLeft: number, totalTime: number): number {
  const progress = 1 - timeLeft / totalTime;
  if (progress > 0.8) return 1.5;
  if (progress > 0.6) return 1.25;
  return 1;
}
