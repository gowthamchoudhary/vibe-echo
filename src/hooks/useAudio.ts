import { useCallback } from 'react';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';

const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? 'https://jayavarapugowtham.workers.dev';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

// In-memory cache for audio blob URLs
const audioCache = new Map<string, string>();

export function useAudio(muted: boolean) {
  const playReactionSound = useCallback(async (characterId: string, reactionId: string) => {
    if (muted) return;

    const cacheKey = `${characterId}:${reactionId}`;

    // Check in-memory cache first
    if (audioCache.has(cacheKey)) {
      const audio = new Audio(audioCache.get(cacheKey)!);
      audio.play().catch(() => {});
      return;
    }

    // Find character and reaction data for the edge function fallback
    const character = CHARACTERS.find(c => c.id === characterId);
    const reaction = REACTIONS.find(r => r.id === reactionId);
    if (!character || !reaction) return;

    // Try Worker first, then fall back to Supabase Edge Function
    let blob: Blob | null = null;

    // Attempt 1: Cloudflare Worker
    if (WORKER_URL) {
      try {
        const response = await fetch(`${WORKER_URL}/sound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId, reactionId }),
        });
        if (response.ok) {
          blob = await response.blob();
        }
      } catch {
        // Worker unavailable, will try edge function
      }
    }

    // Attempt 2: Supabase Edge Function
    if (!blob && SUPABASE_URL) {
      try {
        const text = `[${character.personality}] ${reaction.prompt}`;
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
            },
            body: JSON.stringify({
              characterId,
              reactionId,
              voiceId: character.voiceId,
              text,
            }),
          }
        );
        if (response.ok) {
          blob = await response.blob();
        } else {
          console.warn('Edge function TTS failed:', response.status);
        }
      } catch (error) {
        console.warn('Edge function TTS error:', error);
      }
    }

    if (!blob) return;

    const audioUrl = URL.createObjectURL(blob);
    audioCache.set(cacheKey, audioUrl);

    const audio = new Audio(audioUrl);
    await audio.play().catch(() => {});
  }, [muted]);

  return { playReactionSound };
}
