import { useCallback, useEffect, useRef } from 'react';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';

const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? 'https://jayavarapugowtham.workers.dev';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

// Global cache for audio blob URLs (persists across re-renders)
const audioCache = new Map<string, string>();
// Track in-flight fetches to avoid duplicates
const pendingFetches = new Map<string, Promise<string | null>>();

async function fetchSound(characterId: string, reactionId: string): Promise<string | null> {
  const cacheKey = `${characterId}:${reactionId}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;
  if (pendingFetches.has(cacheKey)) return pendingFetches.get(cacheKey)!;

  const character = CHARACTERS.find(c => c.id === characterId);
  const reaction = REACTIONS.find(r => r.id === reactionId);
  if (!character || !reaction) return null;

  const promise = (async (): Promise<string | null> => {
    let blob: Blob | null = null;

    // Attempt 1: Cloudflare Worker
    if (WORKER_URL) {
      try {
        const response = await fetch(`${WORKER_URL}/sound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId, reactionId }),
        });
        if (response.ok) blob = await response.blob();
      } catch { /* fall through */ }
    }

    // Attempt 2: Supabase Edge Function
    if (!blob && SUPABASE_URL) {
      try {
        const text = `[${character.personality}] ${reaction.prompt}`;
        const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ characterId, reactionId, voiceId: character.voiceId, text }),
        });
        if (response.ok) blob = await response.blob();
      } catch { /* ignore */ }
    }

    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    audioCache.set(cacheKey, url);
    return url;
  })();

  pendingFetches.set(cacheKey, promise);
  promise.finally(() => pendingFetches.delete(cacheKey));
  return promise;
}

export function useAudio(muted: boolean, preloadCharacterIds?: string[]) {
  const preloadedRef = useRef(false);

  // Preload all reaction sounds for given characters on mount
  useEffect(() => {
    if (preloadedRef.current || !preloadCharacterIds?.length) return;
    preloadedRef.current = true;

    // Stagger fetches to avoid rate limits (max 2 concurrent)
    const pairs: { characterId: string; reactionId: string }[] = [];
    for (const cid of preloadCharacterIds) {
      for (const r of REACTIONS) {
        pairs.push({ characterId: cid, reactionId: r.id });
      }
    }

    let i = 0;
    const next = () => {
      if (i >= pairs.length) return;
      const pair = pairs[i++];
      fetchSound(pair.characterId, pair.reactionId)
        .then(() => {
          // Small delay between fetches to avoid 429s
          setTimeout(next, 300);
        })
        .catch(() => setTimeout(next, 500));
    };
    // Start 2 parallel chains
    next();
    next();
  }, [preloadCharacterIds]);

  const playReactionSound = useCallback(async (characterId: string, reactionId: string) => {
    if (muted) return;

    const cacheKey = `${characterId}:${reactionId}`;

    // Play immediately from cache if available
    if (audioCache.has(cacheKey)) {
      const audio = new Audio(audioCache.get(cacheKey)!);
      audio.play().catch(() => {});
      return;
    }

    // Otherwise fetch and play (will be cached for next time)
    const url = await fetchSound(characterId, reactionId);
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(() => {});
    }
  }, [muted]);

  return { playReactionSound };
}
