import { useCallback, useEffect, useRef } from 'react';
import { CHARACTERS, REACTIONS } from '@/utils/sounds';

const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? 'https://jayavarapugowtham.workers.dev';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

const audioCache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string | null>>();

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }
  isPlaying = false;
}

async function fetchSound(characterId: string, reactionId: string): Promise<string | null> {
  const cacheKey = `${characterId}:${reactionId}`;
  if (audioCache.has(cacheKey)) return audioCache.get(cacheKey)!;
  if (pendingFetches.has(cacheKey)) return pendingFetches.get(cacheKey)!;

  const character = CHARACTERS.find((c) => c.id === characterId);
  const reaction = REACTIONS.find((r) => r.id === reactionId);
  if (!character || !reaction) return null;

  const promise = (async (): Promise<string | null> => {
    let blob: Blob | null = null;

    if (WORKER_URL) {
      try {
        const response = await fetch(`${WORKER_URL}/sound`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ characterId, reactionId }),
        });
        if (response.ok) blob = await response.blob();
      } catch {}
    }

    if (!blob && SUPABASE_URL) {
      try {
        const text = `[${character.personality}] ${reaction.prompt}`;
        const response = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({ characterId, reactionId, voiceId: character.voiceId, text }),
        });
        if (response.ok) blob = await response.blob();
      } catch {}
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
  const latestRequestRef = useRef(0);

  useEffect(() => {
    if (muted) {
      stopCurrentAudio();
    }
  }, [muted]);

  useEffect(() => {
    if (preloadedRef.current || !preloadCharacterIds?.length) return;
    preloadedRef.current = true;

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
        .then(() => setTimeout(next, 300))
        .catch(() => setTimeout(next, 500));
    };

    next();
    next();
  }, [preloadCharacterIds]);

  const playReactionSound = useCallback(async (characterId: string, reactionId: string) => {
    if (muted) return;

    const requestId = ++latestRequestRef.current;
    const url = await fetchSound(characterId, reactionId);

    if (!url || requestId !== latestRequestRef.current) return;

    stopCurrentAudio();

    const audio = new Audio(url);
    currentAudio = audio;
    isPlaying = true;

    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      isPlaying = false;
    };

    audio.onerror = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      isPlaying = false;
    };

    try {
      await audio.play();
    } catch {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      isPlaying = false;
    }
  }, [muted]);

  return { playReactionSound, stopCurrentAudio, isPlaying: () => isPlaying };
}
