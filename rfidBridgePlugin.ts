import type { Plugin, ViteDevServer, PreviewServer } from 'vite';

interface RfidScanPayload {
  uid: string;
  device: string;
  timestamp: number;
}

interface SseClient {
  write: (chunk: string) => void;
  end: () => void;
}

interface NodeHttpRequest {
  method?: string;
  on(event: 'data', listener: (chunk: Uint8Array | string) => void): void;
  on(event: 'end' | 'close', listener: () => void): void;
  destroy(): void;
}

interface NodeHttpResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  flushHeaders?(): void;
  write(chunk: string): void;
  end(body?: string): void;
}

function normalizeBridgeUid(raw: string): string {
  const cleaned = raw.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
  if (cleaned.length >= 2 && cleaned.length % 2 === 0) {
    return cleaned.match(/.{1,2}/g)?.join(':') ?? raw.trim().toUpperCase();
  }
  return raw.trim().toUpperCase();
}

function attachRfidBridge(server: ViteDevServer | PreviewServer): void {
  const clients = new Set<SseClient>();
  const decoder = new TextDecoder();
  let lastScan: RfidScanPayload | null = null;

  const heartbeat = setInterval(() => {
    for (const client of clients) {
      try {
        client.write(': ping\n\n');
      } catch {
        clients.delete(client);
      }
    }
  }, 20000);

  server.httpServer?.once('close', () => {
    clearInterval(heartbeat);
    for (const client of clients) {
      try {
        client.end();
      } catch {
        // Ignore errors when closing SSE connections.
      }
    }
    clients.clear();
  });

  server.middlewares.use('/api/rfid-status', (_req, rawRes) => {
    const res = rawRes as unknown as NodeHttpResponse;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(
      JSON.stringify({
        ok: true,
        connectedClients: clients.size,
        lastScan,
      }),
    );
  });

  server.middlewares.use('/api/rfid-stream', (rawReq, rawRes) => {
    const req = rawReq as unknown as NodeHttpRequest;
    const res = rawRes as unknown as NodeHttpResponse;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    const client: SseClient = {
      write: (chunk) => res.write(chunk),
      end: () => res.end(),
    };
    clients.add(client);

    client.write(
      `event: connected\ndata: ${JSON.stringify({ serverTime: Date.now(), clients: clients.size })}\n\n`,
    );

    req.on('close', () => {
      clients.delete(client);
    });
  });

  server.middlewares.use('/api/rfid-scan', (rawReq, rawRes) => {
    const req = rawReq as unknown as NodeHttpRequest;
    const res = rawRes as unknown as NodeHttpResponse;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Usa método POST con { "uid": "AA:BB:CC:DD" }' }));
      return;
    }

    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      if (rawBody.length > 4096) {
        req.destroy();
      }
    });

    req.on('end', () => {
      let uid = '';
      let device = 'esp32-rc522';

      try {
        const parsed = JSON.parse(rawBody) as { uid?: unknown; device?: unknown };
        if (typeof parsed.uid === 'string') {
          uid = normalizeBridgeUid(parsed.uid);
        }
        if (typeof parsed.device === 'string' && parsed.device.trim()) {
          device = parsed.device.trim();
        }
      } catch {
        uid = normalizeBridgeUid(rawBody);
      }

      if (!uid) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'Falta el campo uid' }));
        return;
      }

      const payload: RfidScanPayload = {
        uid,
        device,
        timestamp: Date.now(),
      };
      lastScan = payload;

      const eventFrame = `event: scan\ndata: ${JSON.stringify(payload)}\n\n`;
      for (const client of clients) {
        try {
          client.write(eventFrame);
        } catch {
          clients.delete(client);
        }
      }

      console.log(
        `[ChefCard RFID] Escaneo recibido (${device}): ${uid} -> ${clients.size} cliente(s)`,
      );

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: true, uid, device, deliveredTo: clients.size }));
    });
  });
}

export function rfidBridgePlugin(): Plugin {
  return {
    name: 'chefcard-rfid-bridge',
    configureServer(server) {
      attachRfidBridge(server);
    },
    configurePreviewServer(server) {
      attachRfidBridge(server);
    },
  };
}
