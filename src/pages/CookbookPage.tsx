import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChefHat,
  ChevronDown,
  Clock,
  CreditCard,
  ListChecks,
  Timer,
  Users,
} from 'lucide-react';
import { getCookbookBySlug } from '../data/cookbooks';
import { getRecipesByCookbook } from '../data/recipes';
import { formatTime, formatTotalMinutes } from '../utils/formatters';

interface CookbookLocationState {
  unlockedBy?: 'ndef-url' | 'uid-mapping';
  source?: 'esp32-rfid' | 'web-nfc' | 'simulator' | 'ndef-url';
  uid?: string | null;
}

export function CookbookPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const state = (location.state as CookbookLocationState | null) ?? null;

  const cookbook = slug ? getCookbookBySlug(slug) : undefined;
  const recipes = slug ? getRecipesByCookbook(slug) : [];
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(recipes[0]?.id ?? null);

  if (!cookbook) {
    return (
      <main className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
        <p className="text-4xl">📖</p>
        <h1 className="mt-3 text-xl font-bold text-stone-900">Libro no encontrado</h1>
        <p className="mt-1 text-sm text-stone-500">
          La ruta <code className="font-mono">/book/{slug}</code> no corresponde a ningún libro
          registrado.
        </p>
        <Link
          to="/scan"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-orange-600 px-5 text-sm font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al lector
        </Link>
      </main>
    );
  }

  return (
    <main className="pb-6">
      <header
        className={`relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br ${cookbook.accentBg} px-5 pt-5 pb-7 text-white shadow-lg`}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/scan"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm active:scale-95"
            aria-label="Volver al lector"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {state?.unlockedBy && (
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
            >
              <CreditCard className="h-3.5 w-3.5" />
              {state.source === 'esp32-rfid'
                ? `ESP32 · ${state.uid ?? 'RFID'}`
                : state.unlockedBy === 'ndef-url'
                  ? 'Abierto por URL NDEF'
                  : `Tarjeta ${state.uid ?? ''}`}
            </motion.span>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3.5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/20 text-4xl backdrop-blur-sm">
            {cookbook.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{cookbook.title}</h1>
            <p className="mt-0.5 text-sm text-white/85">{cookbook.subtitle}</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-white/85">{cookbook.description}</p>
      </header>

      <section className="space-y-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            Recetas disponibles ({recipes.length})
          </h2>
          <span className="text-xs font-medium text-stone-500">Toca para previsualizar</span>
        </div>

        {recipes.map((recipe) => {
          const isExpanded = expandedRecipeId === recipe.id;
          const timerCount = recipe.steps.filter((step) => Boolean(step.timerSeconds)).length;

          return (
            <article
              key={recipe.id}
              className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs"
            >
              <button
                type="button"
                onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{recipe.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {recipe.description}
                    </p>
                  </div>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 text-stone-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-stone-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                    {formatTotalMinutes(recipe.prepMinutes, recipe.cookMinutes)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                    <Users className="h-3.5 w-3.5 text-orange-600" />
                    {recipe.defaultServings} porc.
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1">
                    <ChefHat className="h-3.5 w-3.5 text-orange-600" />
                    {recipe.difficulty}
                  </span>
                  {timerCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-orange-700">
                      <Timer className="h-3.5 w-3.5" />
                      {timerCount} {timerCount === 1 ? 'timer' : 'timers'}
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-stone-100 bg-stone-50/70 px-4 pt-3 pb-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <ListChecks className="h-3.5 w-3.5 text-orange-600" />
                    Ingredientes ({recipe.ingredients.length})
                  </p>
                  <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-stone-600">
                    {recipe.ingredients.map((ing) => (
                      <li key={ing.id} className="flex justify-between gap-2">
                        <span>• {ing.name}</span>
                        <span className="shrink-0 font-semibold text-stone-800">
                          {ing.quantity} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3.5 text-xs font-bold text-stone-700">
                    Resumen de pasos ({recipe.steps.length})
                  </p>
                  <ol className="mt-1.5 space-y-1.5 text-xs text-stone-600">
                    {recipe.steps.map((step) => (
                      <li key={step.order} className="flex items-center justify-between gap-2">
                        <span>
                          <strong className="text-stone-800">{step.order}.</strong> {step.title}
                        </span>
                        {step.timerSeconds && (
                          <span className="shrink-0 rounded-md bg-orange-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-orange-700">
                            {formatTime(step.timerSeconds)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
