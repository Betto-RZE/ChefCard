import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Beef,
  BookOpen,
  CakeSlice,
  Leaf,
  Radio,
  Timer,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { COOKBOOKS } from '../data/cookbooks';
import type { Cookbook } from '../types/domain';

interface WelcomePageProps {
  onContinue: () => void;
}

const WALLET_BOOKS = COOKBOOKS.filter((book) => book.slug !== 'cocina-rapida');
const AUTO_ADVANCE_MS = 3000;
const STACK_TRANSITION_MS = 520;
const BOOK_MARKS: Record<string, LucideIcon> = {
  'cocina-vegana': Leaf,
  'carnes-frias': Beef,
  postres: CakeSlice,
};

const HIGHLIGHTS = [
  { icon: BookOpen, label: 'Recetarios' },
  { icon: UtensilsCrossed, label: 'Pasos claros' },
  { icon: Timer, label: 'Temporizadores' },
];

function WalletCard({ book }: { book: Cookbook }) {
  const Mark = BOOK_MARKS[book.slug] ?? BookOpen;

  return (
    <div
      className={`relative aspect-[1.586] w-full overflow-hidden rounded-[1.65rem] border border-white/35 bg-gradient-to-br ${book.accentBg} p-5 text-white shadow-[0_18px_36px_-18px_rgba(20,30,25,0.65)]`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.28),transparent_38%),linear-gradient(135deg,transparent_55%,rgba(20,20,20,0.16))]"
      />
      <div aria-hidden="true" className="absolute -right-3 -bottom-9 text-[8.5rem] leading-none opacity-[0.16]">
        {book.emoji}
      </div>

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/35 bg-white/15 text-white shadow-inner backdrop-blur-sm">
            <Mark className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <Radio className="h-[1.05rem] w-[1.05rem] text-white/85" strokeWidth={1.8} />
        </div>

        <div className="mt-auto pb-2">
          <h2 className="max-w-[15rem] text-[1.35rem] leading-tight font-semibold tracking-[-0.035em] drop-shadow-sm">
            {book.title}
          </h2>
          <p className="mt-1 max-w-[15rem] text-[11px] leading-snug text-white/80">{book.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function WalletCarousel() {
  const [stack, setStack] = useState(WALLET_BOOKS);
  const [leavingBook, setLeavingBook] = useState<Cookbook | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const reduceMotion = useReducedMotion();
  const stackRef = useRef(stack);
  const advancingRef = useRef(false);

  useEffect(() => {
    let transitionTimeout: number | null = null;
    const interval = window.setInterval(() => {
      if (advancingRef.current) return;

      const [frontBook, ...remainingBooks] = stackRef.current;
      if (!frontBook || remainingBooks.length === 0) return;

      advancingRef.current = true;
      setIsAdvancing(true);
      stackRef.current = remainingBooks;
      setStack(remainingBooks);
      setLeavingBook(frontBook);

      transitionTimeout = window.setTimeout(() => {
        const nextStack = [...remainingBooks, frontBook];
        stackRef.current = nextStack;
        setStack(nextStack);
        setLeavingBook(null);
        setIsAdvancing(false);
        advancingRef.current = false;
      }, reduceMotion ? 120 : STACK_TRANSITION_MS);
    }, AUTO_ADVANCE_MS);
    return () => {
      window.clearInterval(interval);
      if (transitionTimeout !== null) window.clearTimeout(transitionTimeout);
    };
  }, [reduceMotion]);

  const selectBook = (slug: string) => {
    if (advancingRef.current) return;
    const selectedIndex = stackRef.current.findIndex((book) => book.slug === slug);
    if (selectedIndex <= 0) return;

    const nextStack = [...stackRef.current.slice(selectedIndex), ...stackRef.current.slice(0, selectedIndex)];
    stackRef.current = nextStack;
    setStack(nextStack);
  };

  return (
    <section aria-label="Tarjetas de recetario" className="mx-auto w-full max-w-none">
      <div className="relative h-[18.75rem] px-1">
        {/* Wallet body */}
        <div className="absolute inset-x-0 bottom-1 h-[8.4rem] overflow-hidden rounded-[2rem] border border-[#40584c] bg-gradient-to-br from-[#334b40] via-[#263d33] to-[#1e332b] shadow-[0_24px_46px_-24px_rgba(20,32,25,0.7)]">
          <div aria-hidden="true" className="absolute inset-[0.55rem] rounded-[1.6rem] border border-dashed border-white/15" />
          <div aria-hidden="true" className="absolute top-5 left-5 h-px w-14 bg-white/15" />
          <div aria-hidden="true" className="absolute top-5 right-5 h-px w-14 bg-white/15" />
          <div className="absolute inset-x-0 bottom-0 flex h-[3.55rem] items-center justify-center border-t border-white/10 bg-gradient-to-b from-[#30473c] to-[#263b31]">
            <span className="h-1 w-9 rounded-full bg-[#d59a61]/80 shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
          </div>
        </div>

        {stack.map((book, index) => (
          <motion.article
            key={book.slug}
            initial={reduceMotion ? false : { opacity: 0, y: -54 }}
            animate={{
              opacity: 1 - index * 0.08,
              y: -index * 18,
              scale: 1 - index * 0.012,
            }}
            transition={{ duration: reduceMotion ? 0.12 : 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-1/2 w-[calc(100%-0.5rem)] max-w-none -translate-x-1/2"
            style={{ zIndex: 30 - index * 10 }}
            aria-live={index === 0 ? 'polite' : undefined}
          >
            <WalletCard book={book} />
          </motion.article>
        ))}

        {leavingBook && (
          <motion.article
            key={`leaving-${leavingBook.slug}`}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: reduceMotion ? -24 : -104, scale: 0.97 }}
            transition={{ duration: reduceMotion ? 0.12 : STACK_TRANSITION_MS / 1000, ease: [0.45, 0, 0.8, 0.35] }}
            className="absolute top-0 left-1/2 z-40 w-[calc(100%-0.5rem)] max-w-none -translate-x-1/2"
            aria-hidden="true"
          >
            <WalletCard book={leavingBook} />
          </motion.article>
        )}
      </div>

      <div className="mt-1 flex items-center justify-center gap-2.5" aria-label="Seleccionar recetario">
        {WALLET_BOOKS.map((book) => (
          <button
            key={book.slug}
            type="button"
            disabled={isAdvancing}
            onClick={() => selectBook(book.slug)}
            aria-label={`Mostrar ${book.title}`}
            aria-current={stack[0]?.slug === book.slug ? 'true' : undefined}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#203b32]"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                stack[0]?.slug === book.slug ? 'w-5 bg-[#203b32]' : 'w-2 bg-stone-400/70'
              }`}
            />
            <span className="sr-only">{book.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function WelcomePage({ onContinue }: WelcomePageProps) {
  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-[#f7f3ea] px-4 pt-7 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#24352e]">
      <div aria-hidden="true" className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full bg-[#e6b885]/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[36%] -left-28 h-64 w-64 rounded-full bg-[#a8b9a8]/25 blur-3xl" />

      <div className="relative z-10 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, delay: 0.16 }}
        >
          <WalletCarousel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.25 }}
          className="mt-3 text-center"
        >
          <h1 className="text-[1.8rem] leading-[1.08] font-semibold tracking-[-0.05em] text-[#203b32]">
            Tu próxima receta,
            <br />
            a un toque.
          </h1>
          <p className="mx-auto mt-2 max-w-[17rem] text-[13px] leading-relaxed text-stone-600">
            Acerca una tarjeta al lector y abre su libro de cocina al instante.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.34 }}
          className="mx-auto mt-5 flex max-w-[19rem] items-center justify-between border-y border-[#ded6c8] py-3"
        >
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] font-medium text-[#52645a]">
              <Icon className="h-3.5 w-3.5 text-[#bd7950]" strokeWidth={1.8} />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="relative z-10 pt-5"
      >
        <button
          type="button"
          onClick={onContinue}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#203b32] px-5 text-[15px] font-semibold text-[#fbf8f0] shadow-[0_12px_24px_-14px_rgba(32,59,50,0.8)] transition-colors hover:bg-[#2b4a3e] active:scale-[0.99]"
        >
          <span>Abrir lector</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </motion.div>
    </main>
  );
}
