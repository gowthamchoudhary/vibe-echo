export interface Env {
  VIBE_SESSION: DurableObjectNamespace;
  VIBECALL_KV: KVNamespace;
  ELEVENLABS_API_KEY: string;
  FRONTEND_URL: string;
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  color: string;
  voiceId: string;
  personality: string;
}

export interface Reaction {
  id: string;
  prompt: string;
}

// Client → Server
export type ClientMessage =
  | { type: 'JOIN'; characterId: string; username: string }
  | { type: 'REACTION'; reactionId: string }
  | { type: 'LEAVE' };

// Server → Client
export type ServerMessage =
  | { type: 'WAITING'; position: number }
  | { type: 'MATCH_FOUND'; sessionId: string; partnerCharacterId: string; partnerName: string }
  | { type: 'REACTION'; reactionId: string; characterId: string }
  | { type: 'SESSION_END'; finalScore: number; reactionCount: number }
  | { type: 'COUNTER_UPDATE'; count: number }
  | { type: 'ERROR'; message: string };

export interface QueueEntry {
  characterId: string;
  username: string;
  ws: WebSocket;
}
