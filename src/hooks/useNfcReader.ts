import { useCallback, useEffect, useRef, useState } from 'react';
import { useCardStore, type ScanSource } from '../store/useCardStore';
import type { NDEFReadingEvent } from '../types/web-nfc';
import {
  buildCookbookNdefUrl,
  normalizeUid,
  parseNdefMessage,
  resolveCardDestination,
  type CardResolution,
} from '../utils/nfcParser';

export type NfcStatus = 'idle' | 'scanning' | 'writing' | 'success' | 'error';
export type BridgeStatus = 'connecting' | 'connected' | 'offline';

export interface NfcScanResult {
  resolution: CardResolution;
  source: ScanSource;
  device?: string;
  timestamp: number;
}

interface UseNfcReaderOptions {
  onScan?: (result: NfcScanResult) => void;
}

function triggerHapticFeedback(pattern: number | number[] = 40): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors on restricted devices.
    }
  }
}

export function useNfcReader(options: UseNfcReaderOptions = {}) {
  const isSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  const [status, setStatus] = useState<NfcStatus>('idle');
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('connecting');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<NfcScanResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const onScanRef = useRef(options.onScan);

  useEffect(() => {
    onScanRef.current = options.onScan;
  }, [options.onScan]);

  const stopScan = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus((current) => (current === 'scanning' || current === 'writing' ? 'idle' : current));
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const processCardPayload = useCallback(
    (payload: {
      uid?: string | null;
      url?: string | null;
      source: ScanSource;
      device?: string;
    }): NfcScanResult => {
      const { mappings, recordScan } = useCardStore.getState();
      const resolution = resolveCardDestination({
        uid: payload.uid,
        url: payload.url,
        mappings,
      });

      const resolvedSlug = resolution.kind === 'resolved' ? resolution.cookbookSlug : null;

      recordScan({
        uid: resolution.uid,
        url: resolution.rawUrl,
        cookbookSlug: resolvedSlug,
        source: payload.source,
      });

      triggerHapticFeedback(resolution.kind === 'resolved' ? [35, 45, 35] : 80);

      const result: NfcScanResult = {
        resolution,
        source: payload.source,
        device: payload.device,
        timestamp: Date.now(),
      };

      setLastResult(result);
      setError(null);
      setStatus('success');
      setStatusMessage(
        resolution.kind === 'resolved'
          ? `Tarjeta reconocida (${resolution.uid ?? 'URL NDEF'}).`
          : `Tarjeta detectada (${resolution.uid ?? 'sin UID'}), aún sin libro asignado.`,
      );

      onScanRef.current?.(result);
      return result;
    },
    [],
  );

  // Real-time SSE listener for the ESP32 + RC522 local bridge (/api/rfid-stream)
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
      }
    };

    const handleScanEvent = (event: MessageEvent<string>) => {
      if (isClosed) return;
      try {
        const data = JSON.parse(event.data) as { uid?: string; device?: string };
        if (data.uid) {
          processCardPayload({
            uid: data.uid,
            source: 'esp32-rfid',
            device: data.device ?? 'esp32-rc522',
          });
        }
      } catch {
        // Ignore malformed SSE messages.
      }
    };

    eventSource.addEventListener('connected', handleConnected);
    eventSource.addEventListener('scan', handleScanEvent);

    eventSource.onopen = () => {
      if (!isClosed) {
        setBridgeStatus('connected');
      }
    };

    eventSource.onerror = () => {
      if (!isClosed) {
        setBridgeStatus('offline');
      }
    };

    return () => {
      isClosed = true;
      eventSource.removeEventListener('connected', handleConnected);
      eventSource.removeEventListener('scan', handleScanEvent);
      eventSource.close();
    };
  }, [processCardPayload]);

  const startScan = useCallback(async () => {
    setError(null);

    if (!isSupported || !window.NDEFReader) {
      setStatus('idle');
      setStatusMessage(
        'Web NFC no está disponible en este navegador. Usa tu lector ESP32 + RC522 o el Simulador RFID.',
      );
      return;
    }

    stopScan();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const ndef = new window.NDEFReader();
      setStatus('scanning');
      setStatusMessage('Acerca tu tarjeta NFC a la parte trasera del celular...');

      await ndef.scan({ signal: controller.signal });

      ndef.onreadingerror = () => {
        setStatus('error');
        setError('No se pudo leer la tarjeta. Acércala nuevamente y mantenla fija un segundo.');
      };

      ndef.onreading = (event: NDEFReadingEvent) => {
        const uid = event.serialNumber ? normalizeUid(event.serialNumber) : null;
        const parsed = parseNdefMessage(event.message);
        const resolvedUrl = parsed.url ?? (parsed.slug ? `/book/${parsed.slug}` : null);

        processCardPayload({
          uid,
          url: resolvedUrl,
          source: 'web-nfc',
        });
      };
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Permiso NFC denegado. Activa NFC en tu teléfono y concede permiso al navegador.'
          : 'No se pudo iniciar el lector NFC. Verifica que NFC esté activado y que estés en HTTPS.';
      setStatus('error');
      setError(message);
    }
  }, [isSupported, processCardPayload, stopScan]);

  const writeCookbookUrl = useCallback(
    async (slug: string): Promise<boolean> => {
      setError(null);

      if (!isSupported || !window.NDEFReader) {
        setError(
          'La escritura NDEF directa requiere Chrome/Edge en Android con HTTPS y tarjetas NTAG215.',
        );
        return false;
      }

      stopScan();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const ndef = new window.NDEFReader();
        const targetUrl = buildCookbookNdefUrl(slug);

        setStatus('writing');
        setStatusMessage('Acerca la tarjeta física NTAG215 para grabar el enlace del libro...');

        await ndef.write(
          {
            records: [
              {
                recordType: 'url',
                data: targetUrl,
              },
            ],
          },
          { overwrite: true, signal: controller.signal },
        );

        triggerHapticFeedback([40, 40, 80]);
        setStatus('success');
        setStatusMessage(`Tarjeta grabada con éxito: ${targetUrl}`);
        return true;
      } catch (err) {
        if (controller.signal.aborted) {
          return false;
        }
        setStatus('error');
        setError(
          err instanceof DOMException && err.name === 'NotAllowedError'
            ? 'Permiso denegado para escribir en la tarjeta NFC.'
            : 'Error al escribir la tarjeta. Asegúrate de usar una tarjeta NTAG213/215/216 reescribible.',
        );
        return false;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [isSupported, stopScan],
  );

  const simulateScan = useCallback(
    (params: { uid?: string; url?: string }) => {
      return processCardPayload({
        uid: params.uid ?? null,
        url: params.url ?? null,
        source: params.url && !params.uid ? 'ndef-url' : 'simulator',
      });
    },
    [processCardPayload],
  );

  const sendTestBridgeScan = useCallback(async (rawUid: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/rfid-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: normalizeUid(rawUid),
          device: 'esp32-test',
        }),
      });
      return response.ok;
    } catch {
      setError('No se pudo contactar /api/rfid-scan. Asegúrate de ejecutar pnpm dev.');
      return false;
    }
  }, []);

  return {
    isSupported,
    bridgeStatus,
    status,
    statusMessage,
    error,
    lastResult,
    startScan,
    stopScan,
    writeCookbookUrl,
    simulateScan,
    sendTestBridgeScan,
  };
}
