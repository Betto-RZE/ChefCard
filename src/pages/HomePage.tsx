import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Cpu,
  CreditCard,
  Radio,
  Smartphone,
  Sparkles,
  Square,
} from 'lucide-react';
import { COOKBOOKS, getCookbookBySlug } from '../data/cookbooks';
import { getRecipesByCookbook } from '../data/recipes';
import { useCardStore } from '../store/useCardStore';
import type { BridgeStatus, NfcStatus } from '../hooks/useNfcReader';

interface HomePageProps {
  isNfcSupported: boolean;
  bridgeStatus: BridgeStatus;
  nfcStatus: NfcStatus;
  nfcMessage: string | null;
  nfcError: string | null;
  onStartScan: () => void;
  onStopScan: () => void;
  onOpenSimulator: () => void;
}

export function HomePage({
  isNfcSupported,
  bridgeStatus,
  nfcStatus,
  nfcMessage,
  nfcError,
  onStartScan,
  onStopScan,
  onOpenSimulator,
}: HomePageProps) {
  const mappings = useCardStore((state) => state.mappings);
  const lastUnlockedSlug = useCardStore((state) => state.lastUnlockedSlug);
  const lastBook = lastUnlockedSlug ? getCookbookBySlug(lastUnlockedSlug) : undefined;

  const isScanning = nfcStatus === 'scanning';
  const isEsp32Ready = bridgeStatus === 'connected';
  const isListening = isScanning || isEsp32Ready;

  const countCardsForBook = (slug: string) =>
    Object.values(mappings).filter((mapping) => mapping.cookbookSlug === slug).length;

  return (
    <main className="px-5 pt-6 pb-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-orange-600 uppercase">
            Asistente de Cocina RFID
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">ChefCard</h1>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isEsp32Ready
              ? 'bg-emerald-100 text-emerald-800'
              : isNfcSupported
                ? 'bg-sky-100 text-sky-800'
                : 'bg-amber-100 text-amber-800'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isEsp32Ready
                ? 'animate-pulse bg-emerald-500'
                : isNfcSupported
                  ? 'bg-sky-500'
                  : 'bg-amber-500'
            }`}
          />
          {isEsp32Ready ? 'ESP32 listo' : isNfcSupported ? 'Web NFC listo' : 'Modo Simulador'}
        </span>
      </header>

      {/* RFID Scanner Hero */}
      <section className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-5 text-white shadow-xl shadow-stone-900/15">
        <div className="flex flex-col items-center text-center">
          <div className="relative my-3 flex h-28 w-28 items-center justify-center">
            {isListening && (
              <>
                <motion.span
                  initial={{ scale: 0.85, opacity: 0.65 }}
                  animate={{ scale: 1.55, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border-2 border-orange-400"
                />
                <motion.span
                  initial={{ scale: 0.85, opacity: 0.5 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 1.8, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border-2 border-orange-300"
                />
              </>
            )}

            <div
              className={`relative flex h-20 w-20 items-center justify-center rounded-3xl transition-colors ${
                isListening
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40'
                  : 'bg-white/10 text-orange-400'
              }`}
            >
              <Radio className="h-9 w-9" />
            </div>
          </div>

          <h2 className="text-lg font-bold">
            {isScanning
              ? 'Esperando tarjeta NFC...'
              : isEsp32Ready
                ? 'Escuchando lector RFID (ESP32)'
                : 'Acerca una tarjeta de cocina'}
          </h2>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-stone-300">
            {isEsp32Ready
              ? 'Acerca tu tarjeta RFID 13.56 MHz al módulo RC522 para abrir el libro automáticamente en tu celular.'
              : isNfcSupported
                ? 'Activa el escáner NFC para leer tu tarjeta física o prueba con el simulador integrado.'
                : 'Conecta el puente local para recibir lecturas del ESP32 + RC522 o usa el Simulador RFID.'}
          </p>

          {isEsp32Ready && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-300">
              <Cpu className="h-3.5 w-3.5" />
              Puente en tiempo real activo (/api/rfid-scan)
            </div>
          )}

          {nfcError && (
            <p className="mt-3 w-full rounded-2xl bg-red-500/20 px-3 py-2 text-xs font-medium text-red-200">
              {nfcError}
            </p>
          )}

          {!nfcError && nfcMessage && (
            <p className="mt-3 w-full rounded-2xl bg-white/10 px-3 py-2 text-xs text-stone-200">
              {nfcMessage}
            </p>
          )}

          <div className="mt-4 flex w-full flex-col gap-2.5">
            {isNfcSupported &&
              (isScanning ? (
                <button
                  type="button"
                  onClick={onStopScan}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/15 text-sm font-bold text-white active:scale-95"
                >
                  <Square className="h-4 w-4 fill-current" />
                  Detener escaneo NFC
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onStartScan}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-bold text-white hover:bg-white/15 active:scale-95"
                >
                  <Smartphone className="h-4 w-4" />
                  Usar NFC del teléfono
                </button>
              ))}

            <button
              type="button"
              onClick={onOpenSimulator}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-600/30 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              Simular tarjeta RFID
            </button>
          </div>
        </div>
      </section>

      {/* Last unlocked cookbook */}
      {lastBook && (
        <section className="mt-5">
          <p className="mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
            Último libro desbloqueado
          </p>
          <Link
            to={`/book/${lastBook.slug}`}
            className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-2xl">
                {lastBook.emoji}
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">{lastBook.title}</p>
                <p className="text-xs text-stone-500">{lastBook.subtitle}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-stone-400" />
          </Link>
        </section>
      )}

      {/* Cookbooks gallery */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-stone-900">
            <BookOpen className="h-4 w-4 text-orange-600" />
            Libros de cocina
          </h2>
          <Link
            to="/cards"
            className="text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            Gestionar tarjetas →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {COOKBOOKS.map((book) => {
            const recipeCount = getRecipesByCookbook(book.slug).length;
            const linkedCards = countCardsForBook(book.slug);

            return (
              <Link
                key={book.slug}
                to={`/book/${book.slug}`}
                className={`group flex flex-col justify-between rounded-3xl bg-gradient-to-br ${book.accentBg} p-4 text-white shadow-md transition-transform active:scale-[0.97]`}
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
                    {book.emoji}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold">
                    <CreditCard className="h-3 w-3" />
                    {linkedCards}
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-sm font-bold leading-snug">{book.title}</h3>
                  <p className="mt-1 text-[11px] text-white/80">
                    {recipeCount} {recipeCount === 1 ? 'receta' : 'recetas'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
