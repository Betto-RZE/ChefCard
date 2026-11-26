import { useState, type FormEvent } from 'react';
import {
  Check,
  Copy,
  Cpu,
  CreditCard,
  History,
  Play,
  Radio,
  RotateCcw,
  Send,
  Trash2,
  Wifi,
} from 'lucide-react';
import { COOKBOOKS, getCookbookBySlug } from '../data/cookbooks';
import { useCardStore } from '../store/useCardStore';
import { normalizeUid } from '../utils/nfcParser';
import type { BridgeStatus, NfcStatus } from '../hooks/useNfcReader';

interface CardsManagerPageProps {
  isNfcSupported: boolean;
  bridgeStatus: BridgeStatus;
  nfcStatus: NfcStatus;
  nfcMessage: string | null;
  nfcError: string | null;
  onStartScan: () => void;
  onStopScan: () => void;
  onSimulateScan: (payload: { uid?: string; url?: string }) => void;
  onSendTestBridgeScan: (uid: string) => Promise<boolean>;
  onOpenSimulator: () => void;
}

const SOURCE_LABELS = {
  'esp32-rfid': 'ESP32 RFID',
  'web-nfc': 'Web NFC',
  simulator: 'Simulador',
  'ndef-url': 'URL NDEF',
} as const;

export function CardsManagerPage({
  isNfcSupported,
  bridgeStatus,
  nfcStatus,
  nfcMessage,
  nfcError,
  onStartScan,
  onStopScan,
  onSimulateScan,
  onSendTestBridgeScan,
  onOpenSimulator,
}: CardsManagerPageProps) {
  const mappings = useCardStore((state) => state.mappings);
  const scanHistory = useCardStore((state) => state.scanHistory);
  const linkCard = useCardStore((state) => state.linkCard);
  const unlinkCard = useCardStore((state) => state.unlinkCard);
  const clearHistory = useCardStore((state) => state.clearHistory);
  const resetDemoCards = useCardStore((state) => state.resetDemoCards);

  const [manualUid, setManualUid] = useState('');
  const [manualSlug, setManualSlug] = useState(COOKBOOKS[0].slug);
  const [manualLabel, setManualLabel] = useState('');
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [testingBridge, setTestingBridge] = useState(false);

  const mappingList = Object.values(mappings).sort((a, b) => b.updatedAt - a.updatedAt);
  const bridgeEndpoint =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/rfid-scan`
      : 'http://192.168.1.X:5173/api/rfid-scan';

  const handleLinkSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!manualUid.trim()) return;
    linkCard(manualUid, manualSlug, manualLabel || 'Tarjeta RFID S50');
    setManualUid('');
    setManualLabel('');
  };

  const handleCopyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(bridgeEndpoint);
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 1800);
    } catch {
      // Clipboard may be unavailable on HTTP non-localhost origins.
    }
  };

  const handleTestBridge = async () => {
    setTestingBridge(true);
    await onSendTestBridgeScan('04:A1:2B:3C');
    setTestingBridge(false);
  };

  return (
    <main className="space-y-5 px-5 pt-6 pb-6">
      <header>
        <p className="text-xs font-semibold tracking-wider text-orange-600 uppercase">
          Laboratorio RFID · ESP32 + RC522
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Gestor de Tarjetas
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Conecta tu ESP32 + RC522 por Wi-Fi, vincula tus tarjetas S50 o prueba con el simulador.
        </p>
      </header>

      {/* ESP32 + RC522 Bridge Card */}
      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Cpu className="h-4 w-4 text-orange-600" />
            Estación ESP32 + RC522
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              bridgeStatus === 'connected'
                ? 'bg-emerald-100 text-emerald-700'
                : bridgeStatus === 'connecting'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-stone-100 text-stone-600'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                bridgeStatus === 'connected'
                  ? 'bg-emerald-500'
                  : bridgeStatus === 'connecting'
                    ? 'bg-amber-500'
                    : 'bg-stone-400'
              }`}
            />
            {bridgeStatus === 'connected'
              ? 'Escuchando en vivo'
              : bridgeStatus === 'connecting'
                ? 'Conectando...'
                : 'Puente apagado'}
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-stone-500">
          Configura esta URL en tu código del ESP32 (<code className="font-mono">SERVER_URL</code>
          ) para enviar cada tarjeta leída directo a este celular:
        </p>

        <div className="mt-2 flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2">
          <code className="flex-1 truncate text-xs text-stone-800">{bridgeEndpoint}</code>
          <button
            type="button"
            onClick={handleCopyEndpoint}
            aria-label="Copiar URL del puente ESP32"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs active:scale-95"
          >
            {copiedEndpoint ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {nfcError && (
          <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {nfcError}
          </p>
        )}

        {!nfcError && nfcMessage && (
          <p className="mt-3 rounded-2xl bg-stone-100 px-3 py-2 text-xs text-stone-700">
            {nfcMessage}
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={bridgeStatus !== 'connected' || testingBridge}
            onClick={() => void handleTestBridge()}
            className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-stone-900 text-xs font-bold text-white active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
          >
            <Send className="h-3.5 w-3.5" />
            {testingBridge ? 'Enviando...' : 'Probar puente HTTP'}
          </button>

          <button
            type="button"
            onClick={onOpenSimulator}
            className="flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-orange-600 text-xs font-bold text-white active:scale-95"
          >
            <Play className="h-3.5 w-3.5" />
            Simular tarjeta
          </button>
        </div>

        {isNfcSupported && (
          <button
            type="button"
            onClick={nfcStatus === 'scanning' ? onStopScan : onStartScan}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-700 active:scale-95"
          >
            <Wifi className="h-4 w-4 text-orange-600" />
            {nfcStatus === 'scanning' ? 'Detener Web NFC local' : 'También activar Web NFC (Android)'}
          </button>
        )}
      </section>

      {/* Manual UID mapping */}
      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xs">
        <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
          <CreditCard className="h-4 w-4 text-orange-600" />
          Vincular UID manualmente
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Al acercar una tarjeta S50 nueva al RC522, también aparecerá un diálogo automático para
          vincularla en un toque.
        </p>

        <form onSubmit={handleLinkSubmit} className="mt-3 space-y-2.5">
          <input
            type="text"
            value={manualUid}
            onChange={(event) => setManualUid(event.target.value)}
            placeholder="UID de tarjeta S50 (ej. A3:4F:12:9B)"
            className="h-11 w-full rounded-xl border border-stone-300 px-3 font-mono text-sm uppercase text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="Libro asociado"
              value={manualSlug}
              onChange={(event) => setManualSlug(event.target.value)}
              className="h-11 rounded-xl border border-stone-300 bg-white px-2.5 text-sm text-stone-900 focus:border-orange-500 focus:outline-none"
            >
              {COOKBOOKS.map((book) => (
                <option key={book.slug} value={book.slug}>
                  {book.emoji} {book.title}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={manualLabel}
              onChange={(event) => setManualLabel(event.target.value)}
              placeholder="Etiqueta (opcional)"
              className="h-11 rounded-xl border border-stone-300 px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-2xl bg-orange-600 text-xs font-bold text-white active:scale-95"
          >
            Guardar vínculo UID
          </button>
        </form>
      </section>

      {/* Linked cards list */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900">
            Tarjetas vinculadas ({mappingList.length})
          </h2>
          <button
            type="button"
            onClick={resetDemoCards}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar demo
          </button>
        </div>

        {mappingList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-center text-xs text-stone-500">
            No tienes tarjetas vinculadas. Acerca una tarjeta al RC522 o agrega un UID arriba.
          </div>
        ) : (
          <div className="space-y-2">
            {mappingList.map((mapping) => {
              const book = getCookbookBySlug(mapping.cookbookSlug);
              return (
                <div
                  key={mapping.uid}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3 shadow-xs"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl">
                      {book?.emoji ?? '💳'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-stone-900">
                        {book?.title ?? mapping.cookbookSlug}
                      </p>
                      <p className="font-mono text-[11px] text-stone-500">
                        {normalizeUid(mapping.uid)}
                        {mapping.customLabel ? ` · ${mapping.customLabel}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSimulateScan({ uid: mapping.uid })}
                      aria-label={`Probar tarjeta ${mapping.uid}`}
                      className="flex h-10 items-center gap-1 rounded-xl bg-orange-50 px-2.5 text-xs font-bold text-orange-700 active:scale-95"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      Probar
                    </button>
                    <button
                      type="button"
                      onClick={() => unlinkCard(mapping.uid)}
                      aria-label={`Desvincular ${mapping.uid}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Scan history */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
            <History className="h-4 w-4 text-orange-600" />
            Historial de escaneos
          </h2>
          {scanHistory.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Limpiar
            </button>
          )}
        </div>

        {scanHistory.length === 0 ? (
          <p className="rounded-2xl bg-stone-100 p-4 text-center text-xs text-stone-500">
            Aún no hay escaneos registrados. Prueba el botón "Probar puente HTTP" o el Simulador.
          </p>
        ) : (
          <div className="space-y-1.5">
            {scanHistory.map((item) => {
              const book = item.cookbookSlug ? getCookbookBySlug(item.cookbookSlug) : null;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-800">
                      {book ? `${book.emoji} ${book.title}` : 'Tarjeta sin vincular'}
                    </p>
                    <p className="font-mono text-[11px] text-stone-500">
                      {item.uid ?? item.url ?? 'Sin identificador'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.source === 'esp32-rfid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {SOURCE_LABELS[item.source]}
                    </span>
                    <p className="mt-0.5 text-[10px] text-stone-400">
                      {new Date(item.timestamp).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
