import { useEffect, useRef, useState, useCallback } from 'react';
import type { ServerMessage, ClientMessage } from '@/types';

// Set this to your deployed Cloudflare Worker URL
const WORKER_URL = import.meta.env.VITE_WORKER_URL ?? '';
const WS_URL = WORKER_URL ? WORKER_URL.replace(/^http/, 'ws') + '/ws' : '';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'waiting' | 'matched';

interface UseWebSocketOptions {
  characterId: string;
  username: string;
  onMatchFound: (partnerCharacterId: string, partnerName: string, sessionId: string) => void;
  onPartnerReaction: (reactionId: string, characterId: string) => void;
  onSessionEnd: (finalScore: number, reactionCount: number) => void;
  onCounterUpdate?: (count: number) => void;
}

export function useWebSocket({
  characterId,
  username,
  onMatchFound,
  onPartnerReaction,
  onSessionEnd,
  onCounterUpdate,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [queuePosition, setQueuePosition] = useState(0);

  const connect = useCallback(() => {
    if (!WS_URL) {
      console.warn('VITE_WORKER_URL not set — running in offline/simulation mode');
      return;
    }

    setStatus('connecting');

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const joinMsg: ClientMessage = { type: 'JOIN', characterId, username };
      ws.send(JSON.stringify(joinMsg));
      setStatus('waiting');
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'WAITING':
            setQueuePosition(msg.position);
            setStatus('waiting');
            break;
          case 'MATCH_FOUND':
            setStatus('matched');
            onMatchFound(msg.partnerCharacterId, msg.partnerName, msg.sessionId);
            break;
          case 'REACTION':
            onPartnerReaction(msg.reactionId, msg.characterId);
            break;
          case 'SESSION_END':
            onSessionEnd(msg.finalScore, msg.reactionCount);
            break;
          case 'COUNTER_UPDATE':
            onCounterUpdate?.(msg.count);
            break;
        }
      } catch {
        // ignore malformed
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
    };

    ws.onerror = () => {
      console.warn('WebSocket error — falling back to simulation mode');
      setStatus('disconnected');
    };
  }, [characterId, username, onMatchFound, onPartnerReaction, onSessionEnd, onCounterUpdate]);

  const sendReaction = useCallback((reactionId: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { type: 'REACTION', reactionId };
      ws.send(JSON.stringify(msg));
    }
  }, []);

  const disconnect = useCallback(() => {
    const ws = wsRef.current;
    if (ws) {
      const msg: ClientMessage = { type: 'LEAVE' };
      try { ws.send(JSON.stringify(msg)); } catch {}
      ws.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { status, queuePosition, connect, sendReaction, disconnect, isOnline: !!WS_URL };
}
