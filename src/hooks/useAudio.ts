import { useCallback, useRef } from 'react';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';

const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? 'https://jayavarapugowtham.workers.dev';

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

    // If no worker URL, skip audio
    if (!WORKER_URL) return;

    try {
      const response = await fetch(`${WORKER_URL}/sound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, reactionId }),
      });

      if (!response.ok) {
        console.warn('Sound request failed:', response.status);
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
