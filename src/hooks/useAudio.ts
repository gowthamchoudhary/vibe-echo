import { useCallback, useRef } from 'react';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// In-memory cache for audio blobs
const audioCache = new Map<string, string>();

export function useAudio(muted: boolean) {
  const playingRef = useRef(false);

  const playReactionSound = useCallback(async (characterId: string, reactionId: string) => {
    if (muted) return;

    const cacheKey = `${characterId}:${reactionId}`;

    // Check in-memory cache first
    if (audioCache.has(cacheKey)) {
      const audio = new Audio(audioCache.get(cacheKey)!);
      audio.play().catch(() => {});
      return;
    }

    const character = CHARACTERS.find(c => c.id === characterId);
    const reaction = REACTIONS.find(r => r.id === reactionId);
    if (!character || !reaction) return;

    const text = `[${character.personality}] ${reaction.prompt}`;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            characterId,
            reactionId,
            voiceId: character.voiceId,
            text,
          }),
        }
      );

      if (!response.ok) {
        console.warn('TTS request failed:', response.status);
        return;
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Cache for future use
      audioCache.set(cacheKey, audioUrl);

      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [muted]);

  return { playReactionSound };
}
