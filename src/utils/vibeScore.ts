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
