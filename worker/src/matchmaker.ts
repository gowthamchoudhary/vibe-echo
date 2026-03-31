import type { QueueEntry, ServerMessage } from './types';

const queue: QueueEntry[] = [];
let activeConnections = 0;

function send(ws: WebSocket, msg: ServerMessage) {
  try {
    ws.send(JSON.stringify(msg));
  } catch {
    // socket may be closed
  }
}

export function getActiveCount(): number {
  return activeConnections;
}

export function addToQueue(entry: QueueEntry): { matched: boolean; partner?: QueueEntry } {
  activeConnections++;

  if (queue.length > 0) {
    const partner = queue.shift()!;
    return { matched: true, partner };
  }

  queue.push(entry);
  send(entry.ws, { type: 'WAITING', position: 1 });

  // Update queue positions
  queue.forEach((q, i) => send(q.ws, { type: 'WAITING', position: i + 1 }));

  return { matched: false };
}

export function removeFromQueue(ws: WebSocket) {
  const idx = queue.findIndex(q => q.ws === ws);
  if (idx !== -1) {
    queue.splice(idx, 1);
    // Update remaining positions
    queue.forEach((q, i) => send(q.ws, { type: 'WAITING', position: i + 1 }));
  }
  activeConnections = Math.max(0, activeConnections - 1);
}

export function decrementActive() {
  activeConnections = Math.max(0, activeConnections - 1);
}
