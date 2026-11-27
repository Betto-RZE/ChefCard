import { useCallback, useEffect, useRef, useState } from 'react';
import { useCardStore } from '../store/useCardStore';
import { normalizeUid, resolveCardDestination, type CardResolution } from '../utils/nfcParser';

export type BridgeStatus = 'connecting' | 'connected' | 'offline';

export interface NfcScanResult {
  resolution: CardResolution;
  source: 'esp32-rfid';
  device?: string;
  timestamp: number;
}

interface UseNfcReaderOptions {
  onScan?: (result: NfcScanResult) => void;
}

export function useNfcReader(options: UseNfcReaderOptions = {}) {
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('connecting');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onScanRef = useRef(options.onScan);

  useEffect(() => {
    onScanRef.current = options.onScan;
  }, [options.onScan]);

  const processCardPayload = useCallback((uid: string, device?: string) => {
    const normalizedUid = normalizeUid(uid);
    const { mappings, recordScan } = useCardStore.getState();
    const resolution = resolveCardDestination({ uid: normalizedUid, mappings });

    recordScan({
      uid: normalizedUid,
      url: null,
      cookbookSlug: resolution.kind === 'resolved' ? resolution.cookbookSlug : null,
      source: 'esp32-rfid',
    });
    setError(null);
    setStatusMessage(
      resolution.kind === 'resolved'
        ? `Tarjeta reconocida (${normalizedUid}).`
        : `Tarjeta nueva detectada (${normalizedUid}); asígnale un libro para guardarla.`,
    );

    onScanRef.current?.({ resolution, source: 'esp32-rfid', device, timestamp: Date.now() });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      setBridgeStatus('offline');
      return;
    }

    let isClosed = false;
    const eventSource = new EventSource('/api/rfid-stream');

    const handleConnected = () => {
      if (!isClosed) {
        setBridgeStatus('connected');
        setError(null);
      }
    };

    const handleScanEvent = (event: MessageEvent<string>) => {
      if (isClosed) return;
      try {
        const data = JSON.parse(event.data) as { uid?: unknown; device?: unknown };
        if (typeof data.uid === 'string' && data.uid.trim()) {
          processCardPayload(data.uid, typeof data.device === 'string' ? data.device : undefined);
        }
      } catch {
        // Ignore malformed SSE messages.
      }
    };

    eventSource.addEventListener('connected', handleConnected);
    eventSource.addEventListener('scan', handleScanEvent);
    eventSource.onopen = handleConnected;
    eventSource.onerror = () => {
      if (!isClosed) {
        setBridgeStatus('offline');
        setError('No se puede conectar al puente RFID local. Inicia la app con pnpm dev.');
      }
    };

    return () => {
      isClosed = true;
      eventSource.removeEventListener('connected', handleConnected);
      eventSource.removeEventListener('scan', handleScanEvent);
      eventSource.close();
    };
  }, [processCardPayload]);

  return { bridgeStatus, statusMessage, error };
}
