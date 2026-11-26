import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, Radio, Sparkles, Timer, UtensilsCrossed } from 'lucide-react';

interface WelcomePageProps {
  onContinue: () => void;
  onContinueWithSimulator: () => void;
}

const HIGHLIGHTS = [
  {
    icon: Radio,
    title: 'Acerca tu tarjeta',
    description: 'Desbloquea un libro de cocina al instante sin buscar entre menús.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Guía paso a paso',
    description: 'Recetas claras pensadas para leer cómodo mientras cocinas.',
  },
  {
    icon: Timer,
    title: 'Temporizadores precisos',
    description: 'Controla tus tiempos de cocción sin perder el hilo.',
  },
];

export function WelcomePage({ onContinue, onContinueWithSimulator }: WelcomePageProps) {
  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden bg-[#faf7f2] px-6 pt-8 pb-[calc(1.75rem+env(safe-area-inset-bottom))]">
      {/* Warm ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-orange-300/35 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-44 -left-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl"
      />

      {/* Top brand bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex items-center justify-between"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/85 px-3.5 py-1.5 shadow-xs backdrop-blur-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-white">
            <ChefHat className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-extrabold tracking-tight text-stone-900">ChefCard</span>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-stone-900/5 px-3 py-1 text-[11px] font-semibold text-stone-600">
          <Radio className="h-3 w-3 text-orange-600" />
          RFID · NFC
        </span>
      </motion.header>

      {/* Center hero visual + copy */}
      <div className="relative z-10 my-auto py-6">
        {/* Stacked physical ChefCards illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative mx-auto mb-8 flex h-48 w-full max-w-[18.5rem] items-center justify-center"
        >
          {/* Back left card */}
          <motion.div
            animate={{ rotate: [-9, -7, -9], y: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1 top-6 flex h-32 w-44 -rotate-8 flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-3.5 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🥑</span>
              <Radio className="h-4 w-4 text-white/70" />
            </div>
            <div>
              <p className="text-xs font-bold">Cocina Vegana</p>
              <p className="font-mono text-[9px] text-white/70">04:A1:2B:3C</p>
            </div>
          </motion.div>

          {/* Back right card */}
          <motion.div
            animate={{ rotate: [9, 11, 9], y: [0, 3, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-1 top-8 flex h-32 w-44 rotate-8 flex-col justify-between rounded-3xl bg-gradient-to-br from-rose-700 to-red-900 p-3.5 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🥩</span>
              <Radio className="h-4 w-4 text-white/70" />
            </div>
            <div>
              <p className="text-xs font-bold">Carnes Frías</p>
              <p className="font-mono text-[9px] text-white/70">04:B8:7D:19</p>
            </div>
          </motion.div>

          {/* Front main card */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 flex h-36 w-52 flex-col justify-between rounded-3xl border border-white/25 bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-4 text-white shadow-2xl shadow-stone-900/30"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/20 text-lg">
                🍰
              </span>
              <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
                <Radio className="h-3 w-3" />
                Lista para leer
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold tracking-wider text-orange-300 uppercase">
                Tarjeta de Cocina
              </p>
              <p className="text-base font-extrabold leading-tight">Postres y Repostería</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Welcome headline & subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-stone-900">
            Bienvenido a tu{' '}
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              recetario interactivo
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-600">
            Tu asistente personal de cocina activado con tarjetas físicas RFID. Acerca una tarjeta y
            empieza a cocinar en segundos.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-6 space-y-2.5"
        >
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-white/80 p-3 shadow-2xs backdrop-blur-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900">{title}</p>
                <p className="mt-0.5 text-xs leading-snug text-stone-500">{description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA in thumb zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.28 }}
        className="relative z-10 space-y-2.5 pt-2"
      >
        <button
          type="button"
          onClick={onContinue}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-base font-bold text-white shadow-lg shadow-orange-600/25 transition active:scale-[0.98]"
        >
          <span>Continuar al lector</span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={onContinueWithSimulator}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 active:scale-[0.99]"
        >
          <Sparkles className="h-3.5 w-3.5 text-orange-600" />
          Ir directo al simulador de tarjetas
        </button>
      </motion.div>
    </main>
  );
}
