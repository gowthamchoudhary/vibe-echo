import type { Character, Reaction } from '@/types';

export const CHARACTERS: Character[] = [
  {
    id: 'robot',
    name: 'Unit-404',
    emoji: '🤖',
    color: '#00f5ff',
    glow: '0 0 30px #00f5ff66',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    personality: 'robotic, glitchy, monotone with sudden bursts',
  },
  {
    id: 'knight',
    name: 'Sir Bonks',
    emoji: '⚔️',
    color: '#ffd700',
    glow: '0 0 30px #ffd70066',
    voiceId: 'ErXwobaYiN019PkySvjV',
    personality: 'dramatic, medieval, overly serious about everything',
  },
  {
    id: 'villain',
    name: 'Dr. Chaos',
    emoji: '😈',
    color: '#ff4444',
    glow: '0 0 30px #ff444466',
    voiceId: 'VR6AewLTigWG4xSOukaG',
    personality: 'evil laugh, theatrical, overdramatic',
  },
  {
    id: 'witch',
    name: 'Zara Hex',
    emoji: '🔮',
    color: '#9b59ff',
    glow: '0 0 30px #9b59ff66',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    personality: 'mysterious, cryptic, speaks in riddles',
  },
];

export const REACTIONS: Reaction[] = [
  {
    id: 'hype',
    emoji: '🔥',
    label: 'Hype',
    color: '#ff6b00',
    prompt: 'Express maximum hype and excitement with just sounds and short exclamations, no real words',
  },
  {
    id: 'confused',
    emoji: '❓',
    label: 'Confused',
    color: '#00f5ff',
    prompt: 'Sound extremely confused and bewildered using only sounds and gibberish, no real words',
  },
  {
    id: 'sad',
    emoji: '💔',
    label: 'Sad',
    color: '#4488ff',
    prompt: 'Express deep sadness and melancholy using only sounds, no real words',
  },
  {
    id: 'angry',
    emoji: '💢',
    label: 'Angry',
    color: '#ff2244',
    prompt: 'Express frustration and anger using only sounds and growls, no real words',
  },
  {
    id: 'laugh',
    emoji: '😂',
    label: 'Laugh',
    color: '#ffdd00',
    prompt: 'Laugh uncontrollably in a unique way fitting the character, using only laugh sounds',
  },
  {
    id: 'mysterious',
    emoji: '✨',
    label: 'Mysterious',
    color: '#9b59ff',
    prompt: 'Make a mysterious and eerie sound, cryptic and unsettling, no real words',
  },
];

export const FUN_FACTS = [
  'The average human makes 38 sounds per minute',
  'Laughter is contagious across 42 cultures',
  'You share this moment with 247 strangers right now',
  'No words needed — vibes are universal',
  'Sound travels 4x faster in water than air',
  'Your brain processes sound in just 0.05 seconds',
];
