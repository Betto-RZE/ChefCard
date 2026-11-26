import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Link2, Radio, Sparkles, X } from 'lucide-react';
import { COOKBOOKS, getCookbookBySlug } from '../../data/cookbooks';
import { useCardStore } from '../../store/useCardStore';
import { normalizeUid } from '../../utils/nfcParser';

export interface SimulatedCardPreset {
  id: string;
  label: string;
  subtitle: string;
  uid?: string;
  url?: string;
  badge: string;
  gradient: string;
  emoji: string;
}

const SIMULATOR_PRESETS: SimulatedCardPreset[] = [
  {
    id: 'demo-vegana',
    label: 'Tarjeta #01',
    subtitle: 'UID mapeado en dispositivo',
    uid: '04:A1:2B:3C',
    badge: 'UID',
    gradient: 'from-emerald-600 to-teal-700',
    emoji: '🥑',
  },
  {
    id: 'demo-carnes',
    label: 'Tarjeta #02',
    subtitle: 'UID mapeado en dispositivo',
    uid: '04:B8:7D:19',
    badge: 'UID',
    gradient: 'from-rose-700 to-red-900',
    emoji: '🥩',
  },
  {
    id: 'demo-postres',
    label: 'Tarjeta #03',
    subtitle: 'UID mapeado en dispositivo',
    uid: '04:C3:5E:90',
    badge: 'UID',
    gradient: 'from-amber-500 to-orange-600',
    emoji: '🍰',
  },
  {
    id: 'demo-ndef-rapida',
    label: 'Tarjeta #04 (URL NDEF)',
    subtitle: 'Simula tarjeta NTAG215 con URL grabada',
    url: '/book/cocina-rapida',
    badge: 'NDEF URL',
    gradient: 'from-orange-500 to-amber-600',
    emoji: '⚡',
  },
  {
    id: 'demo-unknown',
    label: 'Tarjeta Nueva (Sin vincular)',
    subtitle: 'Prueba el flujo de registro rápido',
    uid: '04:9F:EE:11',
    badge: 'NUEVA',
    gradient: 'from-stone-700 to-stone-900',
    emoji: '✨',
  },
];

interface RfidSimulatorSheetProps {
  open: boolean;
  onClose: () => void;
  onSimulate: (payload: { uid?: string; url?: string }) => void;
}

export function RfidSimulatorSheet({ open, onClose, onSimulate }: RfidSimulatorSheetProps) {
  const mappings = useCardStore((state) => state.mappings);
  const [customUid, setCustomUid] = useState('');

  const handlePresetTap = (preset: SimulatedCardPreset) => {
    onSimulate({ uid: preset.uid, url: preset.url });
    onClose();
  };

  const handleCustomSubmit = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = customUid.trim();
    if (!cleaned) return;
    onSimulate({ uid: normalizeUid(cleaned) });
    setCustomUid('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.button
            type="button"
            aria-label="Cerrar simulador RFID"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]"
          />

          <motion.section
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 flex max-h-[86dvh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="flex flex-col items-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-stone-200" />
            </div>

            <div className="flex items-start justify-between px-5 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Modo Pruebas sin Hardware
                </div>
                <h2 className="mt-1 text-lg font-bold text-stone-900">
                  Simulador de Tarjetas RFID
                </h2>
                <p className="text-xs text-stone-500">
                  Toca una tarjeta virtual para disparar el mismo flujo que tu tarjeta física.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-600 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-6">
              {SIMULATOR_PRESETS.map((preset) => {
                const mappedBook = preset.uid
                  ? (() => {
                      const mapping = mappings[normalizeUid(preset.uid)];
                      return mapping ? getCookbookBySlug(mapping.cookbookSlug) : undefined;
                    })()
                  : COOKBOOKS.find((b) => preset.url?.includes(b.slug));

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetTap(preset)}
                    className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${preset.gradient} p-4 text-left text-white shadow-md transition-transform active:scale-[0.98]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl backdrop-blur-sm">
                          {mappedBook?.emoji ?? preset.emoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {mappedBook ? mappedBook.title : preset.label}
                            </span>
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-white/80">
                            {mappedBook ? preset.label : preset.subtitle}
                          </p>
                        </div>
                      </div>
                      <Radio className="h-5 w-5 shrink-0 text-white/80 transition-transform group-hover:scale-110" />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2 text-[11px] font-mono text-white/85">
                      <span className="inline-flex items-center gap-1.5">
                        {preset.uid ? (
                          <>
                            <CreditCard className="h-3.5 w-3.5" />
                            UID: {preset.uid}
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3.5 w-3.5" />
                            {preset.url}
                          </>
                        )}
                      </span>
                      <span className="font-sans font-semibold text-white">Acercar →</span>
                    </div>
                  </button>
                );
              })}

              <form
                onSubmit={handleCustomSubmit}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5"
              >
                <label
                  htmlFor="custom-uid-input"
                  className="block text-xs font-semibold text-stone-700"
                >
                  Simular cualquier UID personalizado
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="custom-uid-input"
                    type="text"
                    value={customUid}
                    onChange={(event) => setCustomUid(event.target.value)}
                    placeholder="Ej. 04:55:AB:12"
                    className="h-11 flex-1 rounded-xl border border-stone-300 bg-white px-3 font-mono text-sm uppercase text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white active:scale-95"
                  >
                    Simular
                  </button>
                </div>
              </form>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
