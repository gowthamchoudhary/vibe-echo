import type { Env, ClientMessage, ServerMessage } from './types';
import { decrementActive } from './matchmaker';

const SESSION_DURATION_MS = 180_000; // 3 minutes

interface Player {
  ws: WebSocket;
  characterId: string;
  username: string;
  reactionCount: number;
}

export class VibeSession implements DurableObject {
  private player1: Player | null = null;
  private player2: Player | null = null;
  private vibeScore = 0;
  private sessionStarted = false;
  private env: Env;

  constructor(private state: DurableObjectState, env: Env) {
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get('Upgrade');

    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const characterId = url.searchParams.get('characterId') ?? 'robot';
    const username = url.searchParams.get('username') ?? 'Stranger';

    server.accept();

    const player: Player = { ws: server, characterId, username, reactionCount: 0 };

    if (!this.player1) {
      this.player1 = player;
    } else if (!this.player2) {
      this.player2 = player;
      this.startSession();
    } else {
      this.send(server, { type: 'ERROR', message: 'Session full' });
      server.close(1000, 'Session full');
      return new Response(null, { status: 101, webSocket: client });
    }

    server.addEventListener('message', (event) => {
      try {
        const msg: ClientMessage = JSON.parse(event.data as string);
        this.handleMessage(player, msg);
      } catch {
        // ignore malformed
      }
    });

    server.addEventListener('close', () => {
      this.handleDisconnect(player);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private startSession() {
    if (!this.player1 || !this.player2) return;
    this.sessionStarted = true;

    // Notify both players
    this.send(this.player1.ws, {
      type: 'MATCH_FOUND',
      sessionId: this.state.id.toString(),
      partnerCharacterId: this.player2.characterId,
      partnerName: this.player2.username,
    });

    this.send(this.player2.ws, {
      type: 'MATCH_FOUND',
      sessionId: this.state.id.toString(),
      partnerCharacterId: this.player1.characterId,
      partnerName: this.player1.username,
    });

    // Auto-end after 3 minutes
    this.state.storage.setAlarm(Date.now() + SESSION_DURATION_MS);
  }

  private handleMessage(player: Player, msg: ClientMessage) {
    if (msg.type === 'REACTION') {
      player.reactionCount++;
      this.vibeScore = Math.min(100, this.vibeScore + Math.floor(Math.random() * 8 + 3));

      const partner = player === this.player1 ? this.player2 : this.player1;
      if (partner) {
        this.send(partner.ws, {
          type: 'REACTION',
          reactionId: msg.reactionId,
          characterId: player.characterId,
        });
      }
    } else if (msg.type === 'LEAVE') {
      this.handleDisconnect(player);
    }
  }

  private handleDisconnect(player: Player) {
    decrementActive();
    this.endSession();
  }

  async alarm() {
    this.endSession();
  }

  private endSession() {
    if (!this.sessionStarted) return;
    this.sessionStarted = false;

    const totalReactions = (this.player1?.reactionCount ?? 0) + (this.player2?.reactionCount ?? 0);
    const endMsg: ServerMessage = {
      type: 'SESSION_END',
      finalScore: this.vibeScore,
      reactionCount: totalReactions,
    };

    if (this.player1) {
      this.send(this.player1.ws, endMsg);
      try { this.player1.ws.close(1000, 'Session ended'); } catch {}
    }
    if (this.player2) {
      this.send(this.player2.ws, endMsg);
      try { this.player2.ws.close(1000, 'Session ended'); } catch {}
    }

    this.player1 = null;
    this.player2 = null;
  }

  private send(ws: WebSocket, msg: ServerMessage) {
    try {
      ws.send(JSON.stringify(msg));
    } catch {}
  }
}
