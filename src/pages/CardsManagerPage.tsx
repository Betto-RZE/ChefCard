import { useState, type FormEvent } from 'react';
import { Check, Copy, Cpu, CreditCard, History, Trash2 } from 'lucide-react';
import { COOKBOOKS, getCookbookBySlug } from '../data/cookbooks';
import { useCardStore } from '../store/useCardStore';
import { normalizeUid } from '../utils/nfcParser';
import type { BridgeStatus } from '../hooks/useNfcReader';

interface CardsManagerPageProps {
  bridgeStatus: BridgeStatus;
  nfcMessage: string | null;
  nfcError: string | null;
}

export function CardsManagerPage({ bridgeStatus, nfcMessage, nfcError }: CardsManagerPageProps) {
  const mappings = useCardStore((state) => state.mappings);
  const scanHistory = useCardStore((state) => state.scanHistory);
  const linkCard = useCardStore((state) => state.linkCard);
  const unlinkCard = useCardStore((state) => state.unlinkCard);
  const clearHistory = useCardStore((state) => state.clearHistory);

  const [manualUid, setManualUid] = useState('');
  const [manualSlug, setManualSlug] = useState(COOKBOOKS[0].slug);
  const [manualLabel, setManualLabel] = useState('');
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const mappingList = Object.values(mappings).sort((a, b) => b.updatedAt - a.updatedAt);
  const bridgeEndpoint =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/rfid-scan`
      : 'http://IP-DE-TU-PC:5173/api/rfid-scan';

  const handleLinkSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!manualUid.trim()) return;
    linkCard(manualUid, manualSlug, manualLabel || 'Tarjeta S50');
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

  return (
    <main className="space-y-5 px-5 pt-6 pb-6">
      <header>
        <p className="text-xs font-semibold tracking-wider text-orange-600 uppercase">
          ESP32 · RC522 · MIFARE Classic S50
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Tarjetas físicas</h1>
        <p className="mt-1 text-xs text-stone-500">
          Registra tus tres tarjetas leyendo sus UID reales con el RC522.
        </p>
      </header>

      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-bold text-stone-900">
            <Cpu className="h-4 w-4 text-orange-600" />
            Puente local de ChefCard
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            bridgeStatus === 'connected'
              ? 'bg-emerald-100 text-emerald-700'
              : bridgeStatus === 'connecting'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-stone-100 text-stone-600'
          }`}>
            {bridgeStatus === 'connected'
              ? 'App conectada'
              : bridgeStatus === 'connecting'
                ? 'Conectando…'
                : 'App desconectada'}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-stone-500">
          Copia esta dirección en <code className="font-mono">SERVER_URL</code> del firmware. Usa
          la IP de la computadora en tu red Wi-Fi, no localhost.
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2">
          <code className="flex-1 truncate text-xs text-stone-800">{bridgeEndpoint}</code>
          <button
            type="button"
            onClick={() => void handleCopyEndpoint()}
            aria-label="Copiar URL del puente ESP32"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs active:scale-95"
          >
            {copiedEndpoint ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          “App conectada” solo indica que el celular está recibiendo eventos del servidor. El ESP32
          y el RC522 se confirman cuando acercas una tarjeta y aparece aquí un UID.
        </p>
        {nfcError && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{nfcError}</p>}
        {nfcMessage && !nfcError && (
          <p className="mt-3 rounded-xl bg-stone-100 p-3 text-xs text-stone-700">{nfcMessage}</p>
        )}
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xs">
        <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900">
          <CreditCard className="h-4 w-4 text-orange-600" />
          Primera configuración
        </h2>
        <ol className="mt-3 space-y-2 pl-5 text-xs leading-relaxed text-stone-600 marker:font-bold marker:text-orange-600">
          <li>Alimenta el RC522 con 3.3 V y conecta los pines según firmware/README.md.</li>
          <li>Conecta computadora, ESP32 y celular a la misma red Wi-Fi de 2.4 GHz.</li>
          <li>Inicia <code className="font-mono">pnpm dev</code> y abre en el celular la dirección Network de Vite.</li>
          <li>Configura el Wi-Fi y <code className="font-mono">SERVER_URL</code> en el sketch y cárgalo al ESP32.</li>
          <li>Acerca cada S50 por separado; asigna un libro cuando aparezca la tarjeta nueva.</li>
        </ol>
        <p className="mt-3 rounded-xl bg-orange-50 p-3 text-xs leading-relaxed text-orange-900">
          Tus tarjetas S50 se identifican por UID. No hace falta grabarles una URL: el ESP32 + RC522
          las lee, y ChefCard guarda la relación UID ↔ libro en este navegador.
        </p>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xs">
        <h2 className="text-sm font-bold text-stone-900">Registrar UID manualmente</h2>
        <p className="mt-1 text-xs text-stone-500">
          Normalmente se vinculan al acercarlas al lector. Usa este formulario solo si ya conoces el UID impreso por el firmware.
        </p>
        <form onSubmit={handleLinkSubmit} className="mt-3 space-y-2.5">
          <input
            type="text"
            value={manualUid}
            onChange={(event) => setManualUid(event.target.value)}
            placeholder="UID leído por el RC522"
            aria-label="UID de tarjeta S50"
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
                <option key={book.slug} value={book.slug}>{book.emoji} {book.title}</option>
              ))}
            </select>
            <input
              type="text"
              value={manualLabel}
              onChange={(event) => setManualLabel(event.target.value)}
              placeholder="Etiqueta (opcional)"
              aria-label="Etiqueta de la tarjeta"
              className="h-11 rounded-xl border border-stone-300 px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="h-11 w-full rounded-2xl bg-orange-600 text-xs font-bold text-white active:scale-95">
            Guardar tarjeta
          </button>
        </form>
      </section>

      <section className="space-y-2.5">
        <h2 className="text-sm font-bold text-stone-900">Tarjetas vinculadas ({mappingList.length})</h2>
        {mappingList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-center text-xs text-stone-500">
            Aún no hay tarjetas. Enciende el lector y acerca tu primera S50.
          </div>
        ) : (
          <div className="space-y-2">
            {mappingList.map((mapping) => {
              const book = getCookbookBySlug(mapping.cookbookSlug);
              return (
                <div key={mapping.uid} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3 shadow-xs">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl">{book?.emoji ?? '💳'}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-stone-900">{mapping.customLabel || book?.title || mapping.cookbookSlug}</p>
                      <p className="font-mono text-[11px] text-stone-500">{normalizeUid(mapping.uid)}{mapping.customLabel ? ` · ${book?.title ?? ''}` : ''}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => unlinkCard(mapping.uid)}
                    aria-label={`Desvincular ${mapping.uid}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
            <History className="h-4 w-4 text-orange-600" /> Escaneos físicos recientes
          </h2>
          {scanHistory.length > 0 && (
            <button type="button" onClick={clearHistory} className="min-h-11 px-2 text-xs font-semibold text-stone-500 hover:text-stone-800">Limpiar</button>
          )}
        </div>
        {scanHistory.length === 0 ? (
          <p className="rounded-2xl bg-stone-100 p-4 text-center text-xs text-stone-500">El UID de cada tarjeta aparecerá aquí después de acercarla al RC522.</p>
        ) : (
          <div className="space-y-1.5">
            {scanHistory.map((item) => {
              const book = item.cookbookSlug ? getCookbookBySlug(item.cookbookSlug) : null;
              return (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-800">{book ? `${book.emoji} ${book.title}` : 'Tarjeta sin vincular'}</p>
                    <p className="font-mono text-[11px] text-stone-500">{item.uid ?? 'Sin UID'}</p>
                  </div>
                  <p className="text-right text-[10px] text-stone-400">
                    {new Date(item.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
