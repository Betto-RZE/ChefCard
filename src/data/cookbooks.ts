import type { Cookbook } from '../types/domain';

export const COOKBOOKS: Cookbook[] = [
  {
    slug: 'cocina-vegana',
    title: 'Cocina Vegana',
    subtitle: 'Plant-based fresco y lleno de sabor',
    description:
      'Bowls nutritivos, salsas cremosas sin lácteos y platillos cotidianos 100% vegetales listos sin complicaciones.',
    themeColor: '#059669',
    accentBg: 'from-emerald-600 to-teal-700',
    emoji: '🥑',
  },
  {
    slug: 'carnes-frias',
    title: 'Carnes Frías y Tablas',
    subtitle: 'Charcutería, marinados y montajes',
    description:
      'Combinaciones equilibradas de embutidos, quesos, aderezos y panes para reuniones o cenas sin prender el horno.',
    themeColor: '#be123c',
    accentBg: 'from-rose-700 to-red-900',
    emoji: '🥩',
  },
  {
    slug: 'postres',
    title: 'Postres y Repostería',
    subtitle: 'Dulces caseros con tiempos precisos',
    description:
      'Recetas probadas de repostería con pasos claros y temporizadores exactos para resultados consistentes.',
    themeColor: '#d97706',
    accentBg: 'from-amber-500 to-orange-600',
    emoji: '🍰',
  },
  {
    slug: 'cocina-rapida',
    title: 'Cocina Rápida',
    subtitle: 'Listo en menos de 20 minutos',
    description:
      'Soluciones prácticas para días ocupados con pocos ingredientes, técnica simple y máximo sabor.',
    themeColor: '#ea580c',
    accentBg: 'from-orange-500 to-amber-600',
    emoji: '⚡',
  },
];

export function getCookbookBySlug(slug: string): Cookbook | undefined {
  return COOKBOOKS.find((book) => book.slug === slug);
}
