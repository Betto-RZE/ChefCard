import { motion, useReducedMotion } from 'framer-motion';

export function StartupSplash() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f7f3ea]"
      aria-label="Iniciando ChefCard"
      role="status"
    >
      <div className="flex flex-col items-center">
        <motion.img
          src="/chefcard-logo.svg"
          alt=""
          initial={reduceMotion ? false : { opacity: 0, scale: 0.72, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="h-[5.25rem] w-[5.25rem] drop-shadow-xl"
        />
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.2, duration: reduceMotion ? 0 : 0.4 }}
          className="mt-4 text-xl font-semibold tracking-tight text-[#203b32]"
        >
          ChefCard
        </motion.span>
        <motion.span
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.45, duration: reduceMotion ? 0 : 0.35 }}
          className="mt-1 text-[10px] font-semibold tracking-[0.24em] text-stone-500 uppercase"
        >
          Recetarios para compartir
        </motion.span>
        <motion.span
          initial={{ scaleX: 0, opacity: 0.5 }}
          animate={{ scaleX: [0, 1, 0.28], opacity: [0.5, 1, 0.8] }}
          transition={{ delay: reduceMotion ? 0 : 0.25, duration: reduceMotion ? 0 : 1.1, ease: 'easeInOut' }}
          className="mt-7 h-0.5 w-14 origin-center rounded-full bg-[#d28a4c]"
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}
