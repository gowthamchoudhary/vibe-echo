import type { Env, ClientMessage } from './types';
import { addToQueue, removeFromQueue, getActiveCount } from './matchmaker';
import { generateSound } from './elevenlabs';

export { VibeSession } from './vibeSession';

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const headers = corsHeaders(env);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Health check
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', service: 'vibecall-worker' }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Live counter
    if (url.pathname === '/counter') {
      return new Response(JSON.stringify({ count: getActiveCount() }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Sound generation
    if (url.pathname === '/sound' && request.method === 'POST') {
      try {
        const { characterId, reactionId } = await request.json() as { characterId: string; reactionId: string };
        const audio = await generateSound(characterId, reactionId, env.ELEVENLABS_API_KEY, env.VIBECALL_KV);
        return new Response(audio, {
          headers: {
            ...headers,
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return new Response(JSON.stringify({ error: message }), {
          status: 500,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
    }

    // WebSocket matchmaking
    if (url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      let joined = false;
      let characterId = '';
      let username = '';

      server.addEventListener('message', (event) => {
        try {
          const msg: ClientMessage = JSON.parse(event.data as string);

          if (msg.type === 'JOIN' && !joined) {
            joined = true;
            characterId = msg.characterId;
            username = msg.username;

            const result = addToQueue({ characterId, username, ws: server });

            if (result.matched && result.partner) {
              // Create a Durable Object session for the pair
              const sessionId = env.VIBE_SESSION.newUniqueId();
              const stub = env.VIBE_SESSION.get(sessionId);

              // Connect both players to the Durable Object
              const p1Url = new URL('https://session/ws');
              p1Url.searchParams.set('characterId', result.partner.characterId);
              p1Url.searchParams.set('username', result.partner.username);

              const p2Url = new URL('https://session/ws');
              p2Url.searchParams.set('characterId', characterId);
              p2Url.searchParams.set('username', username);

              // Notify both players with match info
              const sessionIdStr = sessionId.toString();

              result.partner.ws.send(JSON.stringify({
                type: 'MATCH_FOUND',
                sessionId: sessionIdStr,
                partnerCharacterId: characterId,
                partnerName: username,
              }));

              server.send(JSON.stringify({
                type: 'MATCH_FOUND',
                sessionId: sessionIdStr,
                partnerCharacterId: result.partner.characterId,
                partnerName: result.partner.username,
              }));
            }
          } else if (msg.type === 'LEAVE') {
            removeFromQueue(server);
          }
        } catch {
          // ignore malformed messages
        }
      });

      server.addEventListener('close', () => {
        removeFromQueue(server);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not Found', { status: 404, headers });
  },
};
