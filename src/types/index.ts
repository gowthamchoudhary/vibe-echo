export interface Character {
  id: string;
  name: string;
  emoji: string;
  color: string;
  glow: string;
  voiceId: string;
  personality: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  color: string;
  prompt: string;
}

export interface ReactionEvent {
  reactionId: string;
  characterId: string;
  from: 'self' | 'partner';
  timestamp: number;
}

export interface SessionResult {
  vibeScore: number;
  reactionsSent: number;
  reactionsReceived: number;
  mostUsedReaction: string;
  myCharacter: Character;
  partnerCharacter: Character;
}

export type AppScreen = 'landing' | 'characterSelect' | 'waiting' | 'vibeRoom' | 'result';

export interface FloatingScoreEvent {
  id: number;
  value: number;
  label?: string;
  x: number;
  color: string;
}

export interface FeedbackEvent {
  id: number;
  text: string;
  color: string;
}

// WebSocket message types (mirrors worker/src/types.ts)
export type ClientMessage =
  | { type: 'JOIN'; characterId: string; username: string }
  | { type: 'REACTION'; reactionId: string }
  | { type: 'LEAVE' };

export type ServerMessage =
  | { type: 'WAITING'; position: number }
  | { type: 'MATCH_FOUND'; sessionId: string; partnerCharacterId: string; partnerName: string }
  | { type: 'REACTION'; reactionId: string; characterId: string }
  | { type: 'SESSION_END'; finalScore: number; reactionCount: number }
  | { type: 'COUNTER_UPDATE'; count: number }
  | { type: 'ERROR'; message: string };
