import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Check, X } from 'lucide-react';
import { COOKBOOKS } from '../../data/cookbooks';
import { useCardStore } from '../../store/useCardStore';

interface UnknownCardModalProps {
  uid: string | null;
  onClose: () => void;
  onLinked: (cookbookSlug: string) => void;
}

export function UnknownCardModal({ uid, onClose, onLinked }: UnknownCardModalProps) {
  const linkCard = useCardStore((state) => state.linkCard);
  const [selectedSlug, setSelectedSlug] = useState(COOKBOOKS[0].slug);
  const [label, setLabel] = useState('');

  const handleConfirm = () => {
    if (!uid) return;
    linkCard(uid, selectedSlug, label || 'Mi Tarjeta RFID');
    onLinked(selectedSlug);
    setLabel('');
  };

  return (
    <AnimatePresence>
      {uid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Cerrar diálogo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/55 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">Tarjeta nueva detectada</h2>
                  <p className="font-mono text-xs text-stone-500">UID: {uid}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-stone-600">
              Esta tarjeta todavía no está vinculada. Elige qué libro de cocina abrirá al acercarla:
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2">
              {COOKBOOKS.map((book) => {
                const isSelected = selectedSlug === book.slug;
                return (
                  <button
                    key={book.slug}
                    type="button"
                    onClick={() => setSelectedSlug(book.slug)}
                    className={`flex min-h-12 items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left transition ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-stone-900'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-xl">{book.emoji}</span>
                      <span className="text-sm font-semibold">{book.title}</span>
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-orange-600" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <label htmlFor="card-label-input" className="text-xs font-semibold text-stone-600">
                Nombre opcional de la tarjeta
              </label>
              <input
                id="card-label-input"
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Ej. Tarjeta blanca de la cocina"
                className="mt-1 h-11 w-full rounded-xl border border-stone-300 px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-12 flex-1 rounded-2xl border border-stone-200 text-sm font-semibold text-stone-700 active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-12 flex-1 rounded-2xl bg-orange-600 text-sm font-semibold text-white shadow-md shadow-orange-600/20 active:scale-95"
              >
                Vincular y abrir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
