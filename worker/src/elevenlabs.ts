import type { Character, Reaction } from './types';

const CHARACTERS: Character[] = [
  {
    id: 'robot',
    name: 'Unit-404',
    emoji: '🤖',
    color: '#00f5ff',
    voiceId: 'pNInz6obpgDQGcFmaJgB',
    personality: 'robotic, glitchy, monotone with sudden bursts',
  },
  {
    id: 'knight',
    name: 'Sir Bonks',
    emoji: '⚔️',
    color: '#ffd700',
    voiceId: 'ErXwobaYiN019PkySvjV',
    personality: 'dramatic, medieval, overly serious about everything',
  },
  {
    id: 'villain',
    name: 'Dr. Chaos',
    emoji: '😈',
    color: '#ff4444',
    voiceId: 'VR6AewLTigWG4xSOukaG',
    personality: 'evil laugh, theatrical, overdramatic',
  },
  {
    id: 'witch',
    name: 'Zara Hex',
    emoji: '🔮',
    color: '#9b59ff',
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    personality: 'mysterious, cryptic, speaks in riddles',
  },
];

const REACTIONS: Reaction[] = [
  { id: 'hype', prompt: 'Express maximum hype and excitement with just sounds and short exclamations, no real words' },
  { id: 'confused', prompt: 'Sound extremely confused and bewildered using only sounds and gibberish, no real words' },
  { id: 'sad', prompt: 'Express deep sadness and melancholy using only sounds, no real words' },
  { id: 'angry', prompt: 'Express frustration and anger using only sounds and growls, no real words' },
  { id: 'laugh', prompt: 'Laugh uncontrollably in a unique way fitting the character, using only laugh sounds' },
  { id: 'mysterious', prompt: 'Make a mysterious and eerie sound, cryptic and unsettling, no real words' },
];

export async function generateSound(
  characterId: string,
  reactionId: string,
  apiKey: string,
  kv: KVNamespace
): Promise<ArrayBuffer> {
  const cacheKey = `sound:${characterId}:${reactionId}`;

  // Check KV cache first
  const cached = await kv.get(cacheKey, 'arrayBuffer');
  if (cached) return cached;

  const character = CHARACTERS.find(c => c.id === characterId);
  const reaction = REACTIONS.find(r => r.id === reactionId);

  if (!character || !reaction) {
    throw new Error(`Invalid character "${characterId}" or reaction "${reactionId}"`);
  }

  const text = `[${character.personality}] ${reaction.prompt}`;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${character.voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.8,
          style: 0.9,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs error ${response.status}: ${errText}`);
  }

  const audioBuffer = await response.arrayBuffer();

  // Cache in KV for 24 hours
  await kv.put(cacheKey, audioBuffer, { expirationTtl: 86400 });

  return audioBuffer;
}
