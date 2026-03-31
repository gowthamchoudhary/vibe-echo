# VibeCall — Cloudflare Worker Deployment

## Prerequisites
- [Cloudflare account](https://dash.cloudflare.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- [ElevenLabs API key](https://elevenlabs.io/)

## Setup

```bash
cd worker
npm install
```

### 1. Create KV Namespace
```bash
wrangler kv:namespace create "VIBECALL_KV"
```
Copy the output ID into `wrangler.toml` → `[[kv_namespaces]]` → `id`.

### 2. Set ElevenLabs API Key
```bash
wrangler secret put ELEVENLABS_API_KEY
```

### 3. Update Frontend URL
In `wrangler.toml`, set `FRONTEND_URL` to your deployed frontend URL.

### 4. Deploy
```bash
wrangler deploy
```

### 5. Set Worker URL in Frontend
After deploying, set `VITE_WORKER_URL` in your frontend environment:
```
VITE_WORKER_URL=https://vibecall-worker.<your-subdomain>.workers.dev
```

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Health check |
| `/ws` | GET (WS) | WebSocket matchmaking |
| `/sound` | POST | Generate TTS audio (cached 24h in KV) |
| `/counter` | GET | Live user count |

## Architecture

- **Matchmaker** (`matchmaker.ts`): In-memory queue, pairs users, creates Durable Object sessions
- **VibeSession** (`vibeSession.ts`): Durable Object — one per matched pair, relays reactions, auto-ends after 3 min
- **ElevenLabs** (`elevenlabs.ts`): TTS generation with KV caching
