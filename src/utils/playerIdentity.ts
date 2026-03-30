const ADJECTIVES = [
  'Chaos', 'Neon', 'Glitch', 'Cosmic', 'Shadow', 'Pixel', 'Turbo', 'Hyper',
  'Mystic', 'Phantom', 'Cyber', 'Astral', 'Void', 'Flux', 'Nova', 'Drift',
  'Zen', 'Rogue', 'Feral', 'Lunar', 'Solar', 'Prism', 'Echo', 'Blaze',
];

const NOUNS = [
  'Penguin', 'Witch', 'Knight', 'Phoenix', 'Dragon', 'Wolf', 'Fox', 'Raven',
  'Serpent', 'Tiger', 'Owl', 'Falcon', 'Panther', 'Viper', 'Sphinx', 'Wraith',
  'Ghost', 'Storm', 'Flame', 'Frost', 'Spark', 'Shade', 'Pulse', 'Wave',
];

export function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 99) + 1;
  return `${adj}${noun}${num}`;
}

export interface PlayerStats {
  username: string;
  totalVibes: number;
  highestScore: number;
  totalReactionsSent: number;
  playStyle: PlayStyle;
}

export type PlayStyle = 'Chaotic' | 'Calm' | 'Mysterious' | 'Reactive';

const STORAGE_KEY = 'vibecall_player';

export function getPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PlayerStats;
  } catch { /* ignore */ }
  const stats: PlayerStats = {
    username: generateUsername(),
    totalVibes: 0,
    highestScore: 0,
    totalReactionsSent: 0,
    playStyle: 'Reactive',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  return stats;
}

export function updatePlayerStats(update: Partial<Omit<PlayerStats, 'username'>>): PlayerStats {
  const current = getPlayerStats();
  const updated = { ...current, ...update };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function determinePlayStyle(
  reactionCounts: Record<string, number>
): PlayStyle {
  const total = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return 'Calm';
  const topReaction = Object.entries(reactionCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
  if (topReaction === 'mysterious' || topReaction === 'sad') return 'Mysterious';
  if (topReaction === 'angry' || topReaction === 'hype') return 'Chaotic';
  if (total > 20) return 'Reactive';
  return 'Calm';
}

// Vibe list (temporary friends)
const VIBE_LIST_KEY = 'vibecall_vibe_list';

export interface VibeFriend {
  username: string;
  characterId: string;
  vibeScore: number;
  timestamp: number;
}

export function getVibeList(): VibeFriend[] {
  try {
    const raw = localStorage.getItem(VIBE_LIST_KEY);
    if (raw) return JSON.parse(raw) as VibeFriend[];
  } catch { /* ignore */ }
  return [];
}

export function addToVibeList(friend: VibeFriend): void {
  const list = getVibeList();
  list.unshift(friend);
  if (list.length > 20) list.pop();
  localStorage.setItem(VIBE_LIST_KEY, JSON.stringify(list));
}
