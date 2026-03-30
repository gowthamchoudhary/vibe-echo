export type ChallengeType = 'match_vibe' | 'guess_mood' | 'sync_pulse' | 'free_react';

export interface Challenge {
  type: ChallengeType;
  title: string;
  description: string;
  emoji: string;
  duration: number; // seconds
}

export const CHALLENGES: Challenge[] = [
  {
    type: 'match_vibe',
    title: 'Match the Vibe',
    emoji: '🎯',
    description: 'Send the same reaction as your partner!',
    duration: 20,
  },
  {
    type: 'guess_mood',
    title: 'Guess the Mood',
    emoji: '🔮',
    description: 'Guess what reaction your partner will send!',
    duration: 20,
  },
  {
    type: 'sync_pulse',
    title: 'Sync Pulse',
    emoji: '💫',
    description: 'Tap in rhythm with the pulse!',
    duration: 20,
  },
  {
    type: 'free_react',
    title: 'Free Vibe',
    emoji: '⚡',
    description: 'React freely — build your combo!',
    duration: 20,
  },
];

export function getNextChallenge(currentIndex: number): number {
  return (currentIndex + 1) % CHALLENGES.length;
}

export function checkMatchVibe(
  myReaction: string,
  partnerReaction: string | null,
  timeDiffMs: number
): 'perfect' | 'match' | 'miss' {
  if (!partnerReaction) return 'miss';
  if (myReaction === partnerReaction && timeDiffMs < 3000) {
    return timeDiffMs < 1000 ? 'perfect' : 'match';
  }
  return 'miss';
}
