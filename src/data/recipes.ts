import type { Recipe } from '../types/domain';

export const RECIPES: Recipe[] = [
  {
    id: 'bowl-quinoa-garbanzo',
    cookbookSlug: 'cocina-vegana',
    title: 'Bowl de Quinoa y Garbanzos Especiados',
    description:
      'Quinoa esponjosa con garbanzos crujientes al pimentón ahumado, aguacate y aderezo cremoso de tahini y limón.',
    prepMinutes: 10,
    cookMinutes: 15,
    defaultServings: 2,
    difficulty: 'Fácil',
    ingredients: [
      { id: 'v1-1', name: 'Quinoa enjuagada', quantity: 150, unit: 'g' },
      { id: 'v1-2', name: 'Garbanzos cocidos y escurridos', quantity: 240, unit: 'g' },
      { id: 'v1-3', name: 'Aguacate maduro', quantity: 1, unit: 'pza' },
      { id: 'v1-4', name: 'Pimentón ahumado', quantity: 1, unit: 'cdta' },
      { id: 'v1-5', name: 'Tahini (pasta de ajonjolí)', quantity: 2, unit: 'cdas' },
      { id: 'v1-6', name: 'Jugo de limón', quantity: 2, unit: 'cdas' },
      { id: 'v1-7', name: 'Aceite de oliva', quantity: 1, unit: 'cda' },
    ],
    steps: [
      {
        order: 1,
        title: 'Cocer la quinoa',
        instruction:
          'Coloca la quinoa en una olla con el doble de agua y una pizca de sal. Lleva a hervor, baja el fuego al mínimo y tapa.',
        timerSeconds: 720,
        tip: 'No destapes la olla durante la cocción para que el grano quede suelto.',
      },
      {
        order: 2,
        title: 'Dorar los garbanzos',
        instruction:
          'Seca muy bien los garbanzos con papel absorbente. Saltéalos en sartén caliente con aceite de oliva, pimentón ahumado y sal hasta que queden crujientes.',
        timerSeconds: 360,
      },
      {
        order: 3,
        title: 'Preparar aderezo de tahini',
        instruction:
          'Mezcla el tahini, el jugo de limón, una pizca de sal y 2 cucharadas de agua tibia hasta lograr una textura cremosa.',
      },
      {
        order: 4,
        title: 'Montar el bowl',
        instruction:
          'Sirve la quinoa como base, agrega los garbanzos calientes, láminas de aguacate y baña con el aderezo de tahini.',
      },
    ],
  },
  {
    id: 'pasta-cremosa-aguacate',
    cookbookSlug: 'cocina-vegana',
    title: 'Pasta Cremosa de Aguacate y Albahaca',
    description:
      'Salsa verde sedosa hecha en frío mientras se cuece la pasta, con toque cítrico y ajo suave.',
    prepMinutes: 8,
    cookMinutes: 10,
    defaultServings: 2,
    difficulty: 'Fácil',
    ingredients: [
      { id: 'v2-1', name: 'Pasta corta o espagueti', quantity: 200, unit: 'g' },
      { id: 'v2-2', name: 'Aguacate maduro', quantity: 1, unit: 'pza' },
      { id: 'v2-3', name: 'Hojas de albahaca fresca', quantity: 1, unit: 'taza' },
      { id: 'v2-4', name: 'Diente de ajo pequeño', quantity: 1, unit: 'pza' },
      { id: 'v2-5', name: 'Jugo de limón', quantity: 2, unit: 'cdas' },
      { id: 'v2-6', name: 'Aceite de oliva extra virgen', quantity: 2, unit: 'cdas' },
    ],
    steps: [
      {
        order: 1,
        title: 'Cocer la pasta al dente',
        instruction:
          'Hierve abundante agua con sal y cuece la pasta según el empaque hasta que esté al dente. Reserva media taza del agua de cocción.',
        timerSeconds: 540,
      },
      {
        order: 2,
        title: 'Licuar la salsa verde',
        instruction:
          'Procesa aguacate, albahaca, ajo, jugo de limón, aceite de oliva y sal hasta obtener una crema tersa.',
        tip: 'Agrega 2 cucharadas del agua caliente de la pasta si quieres una salsa más ligera.',
      },
      {
        order: 3,
        title: 'Integrar fuera del fuego',
        instruction:
          'Mezcla la pasta escurrida con la salsa de aguacate fuera del fuego para conservar el color verde brillante y sirve de inmediato.',
      },
    ],
  },
  {
    id: 'tabla-mediterranea-charcuteria',
    cookbookSlug: 'carnes-frias',
    title: 'Tabla Mediterránea de Carnes Frías',
    description:
      'Montaje equilibrado con jamón serrano, salami, queso manchego, aceitunas marinadas y miel con romero.',
    prepMinutes: 15,
    cookMinutes: 0,
    defaultServings: 4,
    difficulty: 'Fácil',
    ingredients: [
      { id: 'c1-1', name: 'Jamón serrano en lonchas finas', quantity: 120, unit: 'g' },
      { id: 'c1-2', name: 'Salami tipo Génova', quantity: 100, unit: 'g' },
      { id: 'c1-3', name: 'Queso manchego semicurado', quantity: 150, unit: 'g' },
      { id: 'c1-4', name: 'Aceitunas verdes sin hueso', quantity: 80, unit: 'g' },
      { id: 'c1-5', name: 'Uvas verdes o rojas', quantity: 150, unit: 'g' },
      { id: 'c1-6', name: 'Pan rústico o grissinis', quantity: 1, unit: 'pza' },
      { id: 'c1-7', name: 'Miel de abeja', quantity: 2, unit: 'cdas' },
    ],
    steps: [
      {
        order: 1,
        title: 'Atemperar carnes y quesos',
        instruction:
          'Saca los embutidos y el queso del refrigerador antes de servir para que liberen todo su aroma y textura.',
        timerSeconds: 600,
        tip: 'Los quesos curados y embutidos saben mucho mejor a temperatura ambiente.',
      },
      {
        order: 2,
        title: 'Cortar quesos y ubicar anclas',
        instruction:
          'Corta el manchego en triángulos delgados y coloca en la tabla los recipientes pequeños con aceitunas y miel como puntos de anclaje.',
      },
      {
        order: 3,
        title: 'Doblar y montar embutidos',
        instruction:
          'Dobla las lonchas de jamón serrano en abanico y el salami en cuartos formando una línea sinuosa. Rellena espacios con uvas y pan.',
      },
    ],
  },
  {
    id: 'panini-pastrami-mostaza',
    cookbookSlug: 'carnes-frias',
    title: 'Panini Caliente de Pastrami y Queso Suizo',
    description:
      'Pan artesanal crujiente con capas generosas de pastrami, queso suizo fundido, pepinillos y mostaza antigua.',
    prepMinutes: 7,
    cookMinutes: 8,
    defaultServings: 2,
    difficulty: 'Fácil',
    ingredients: [
      { id: 'c2-1', name: 'Pan ciabatta o masa madre', quantity: 2, unit: 'pzas' },
      { id: 'c2-2', name: 'Pastrami rebanado fino', quantity: 160, unit: 'g' },
      { id: 'c2-3', name: 'Queso suizo o emmental', quantity: 4, unit: 'rebanadas' },
      { id: 'c2-4', name: 'Mostaza antigua', quantity: 2, unit: 'cdas' },
      { id: 'c2-5', name: 'Pepinillos en láminas', quantity: 6, unit: 'pzas' },
      { id: 'c2-6', name: 'Mantequilla suave', quantity: 1, unit: 'cda' },
    ],
    steps: [
      {
        order: 1,
        title: 'Armar el panini',
        instruction:
          'Unta mostaza antigua en la base del pan, acomoda capas sueltas de pastrami, pepinillos y queso suizo encima.',
      },
      {
        order: 2,
        title: 'Tostar con peso en sartén',
        instruction:
          'Unta ligeramente el exterior con mantequilla y cocina en sartén a fuego medio-bajo presionando con una espátula o tapa pesada.',
        timerSeconds: 240,
      },
      {
        order: 3,
        title: 'Voltear y fundir',
        instruction:
          'Voltea con cuidado y dora el otro lado hasta que el pan esté crujiente y el queso completamente derretido.',
        timerSeconds: 180,
      },
    ],
  },
  {
    id: 'mousse-chocolate-oscuro',
    cookbookSlug: 'postres',
    title: 'Mousse Aireada de Chocolate Oscuro',
    description:
      'Postre clásico de textura ligera e intensa con chocolate al 70% y toque sutil de vainilla.',
    prepMinutes: 15,
    cookMinutes: 5,
    defaultServings: 4,
    difficulty: 'Media',
    ingredients: [
      { id: 'p1-1', name: 'Chocolate oscuro 70% troceado', quantity: 180, unit: 'g' },
      { id: 'p1-2', name: 'Crema para batir muy fría', quantity: 250, unit: 'ml' },
      { id: 'p1-3', name: 'Azúcar glas', quantity: 2, unit: 'cdas' },
      { id: 'p1-4', name: 'Extracto de vainilla', quantity: 1, unit: 'cdta' },
      { id: 'p1-5', name: 'Pizca de sal de mar', quantity: 1, unit: 'pizca' },
    ],
    steps: [
      {
        order: 1,
        title: 'Fundir el chocolate a baño María',
        instruction:
          'Derrite el chocolate en un bowl sobre agua apenas caliente sin que el fondo toque el agua. Retira y deja entibiar.',
        timerSeconds: 240,
        tip: 'Si el chocolate está demasiado caliente al mezclar, bajará el aire de la crema.',
      },
      {
        order: 2,
        title: 'Montar la crema',
        instruction:
          'Bate la crema fría con el azúcar glas y la vainilla hasta formar picos suaves y brillantes.',
      },
      {
        order: 3,
        title: 'Integrar con movimientos envolventes',
        instruction:
          'Incorpora un tercio de la crema al chocolate tibio para igualar densidades y luego dobla el resto con espátula suavemente.',
      },
      {
        order: 4,
        title: 'Refrigerar antes de servir',
        instruction:
          'Reparte en vasitos y refrigera para que tome cuerpo firme y aireado. Termina con una pizca de sal de mar.',
        timerSeconds: 1800,
      },
    ],
  },
  {
    id: 'galletas-chispas-sarten',
    cookbookSlug: 'postres',
    title: 'Galleta Gigante en Sartén (Skillet Cookie)',
    description:
      'Bordes dorados y centro suave de chocolate derretido, lista en un solo molde sin refrigerar masa.',
    prepMinutes: 10,
    cookMinutes: 16,
    defaultServings: 4,
    difficulty: 'Fácil',
    ingredients: [
      { id: 'p2-1', name: 'Mantequilla derretida', quantity: 80, unit: 'g' },
      { id: 'p2-2', name: 'Azúcar mascabado', quantity: 90, unit: 'g' },
      { id: 'p2-3', name: 'Huevo a temperatura ambiente', quantity: 1, unit: 'pza' },
      { id: 'p2-4', name: 'Harina de trigo', quantity: 140, unit: 'g' },
      { id: 'p2-5', name: 'Polvo para hornear', quantity: 0.5, unit: 'cdta' },
      { id: 'p2-6', name: 'Chispas de chocolate semiamargo', quantity: 100, unit: 'g' },
    ],
    steps: [
      {
        order: 1,
        title: 'Precalentar el horno',
        instruction:
          'Precalienta el horno a 180 °C y engrasa una sartén apta para horno (o molde de 20 cm).',
      },
      {
        order: 2,
        title: 'Mezclar la masa',
        instruction:
          'Bate la mantequilla derretida con el azúcar mascabado y el huevo. Integra harina, polvo para hornear y casi todas las chispas.',
      },
      {
        order: 3,
        title: 'Hornear hasta dorar bordes',
        instruction:
          'Extiende la masa en la sartén, reparte las chispas restantes arriba y hornea hasta que los bordes estén dorados y el centro aún tierno.',
        timerSeconds: 960,
        tip: 'Deja reposar 5 minutos fuera del horno antes de servir con helado.',
      },
    ],
  },
  {
    id: 'huevos-shakshuka-expres',
    cookbookSlug: 'cocina-rapida',
    title: 'Shakshuka Exprés en Sartén',
    description:
      'Huevos pochados en salsa especiada de jitomate, comino y pimentón, listos en 15 minutos con pan tostado.',
    prepMinutes: 5,
    cookMinutes: 12,
    defaultServings: 2,
    difficulty: 'Fácil',
    ingredients: [
      { id: 'r1-1', name: 'Huevos', quantity: 4, unit: 'pzas' },
      { id: 'r1-2', name: 'Puré de tomate triturado', quantity: 400, unit: 'g' },
      { id: 'r1-3', name: 'Dientes de ajo picados', quantity: 2, unit: 'pzas' },
      { id: 'r1-4', name: 'Comino molido', quantity: 0.5, unit: 'cdta' },
      { id: 'r1-5', name: 'Pimentón dulce o picante', quantity: 1, unit: 'cdta' },
      { id: 'r1-6', name: 'Aceite de oliva', quantity: 1, unit: 'cda' },
    ],
    steps: [
      {
        order: 1,
        title: 'Sofreír especias y tomate',
        instruction:
          'Calienta el aceite en sartén, sofríe el ajo con comino y pimentón 30 segundos y añade el tomate triturado con sal.',
        timerSeconds: 300,
      },
      {
        order: 2,
        title: 'Pochar los huevos',
        instruction:
          'Haz 4 huecos en la salsa, casca un huevo en cada hueco, tapa la sartén y cocina a fuego bajo hasta que las claras cuajen y las yemas sigan cremosas.',
        timerSeconds: 360,
      },
      {
        order: 3,
        title: 'Servir directo de la sartén',
        instruction:
          'Retira del fuego, añade pimienta recién molida y acompaña con pan tostado.',
      },
    ],
  },
  {
    id: 'salteado-arroz-teriyaki',
    cookbookSlug: 'cocina-rapida',
    title: 'Salteado Rápido de Arroz y Vegetales Teriyaki',
    description:
      'Sartén de fuego alto con brócoli, zanahoria, jengibre y glaseado brillante de soya y miel.',
    prepMinutes: 6,
    cookMinutes: 9,
    defaultServings: 2,
    difficulty: 'Fácil',
    ingredients: [
      { id: 'r2-1', name: 'Arroz cocido frío', quantity: 300, unit: 'g' },
      { id: 'r2-2', name: 'Floretes pequeños de brócoli', quantity: 150, unit: 'g' },
      { id: 'r2-3', name: 'Zanahoria en tiras finas', quantity: 1, unit: 'pza' },
      { id: 'r2-4', name: 'Salsa de soya baja en sodio', quantity: 3, unit: 'cdas' },
      { id: 'r2-5', name: 'Miel o jarabe de maple', quantity: 1, unit: 'cda' },
      { id: 'r2-6', name: 'Aceite de ajonjolí o vegetal', quantity: 1, unit: 'cda' },
    ],
    steps: [
      {
        order: 1,
        title: 'Saltear vegetales a fuego alto',
        instruction:
          'Calienta el aceite en sartén amplia y saltea el brócoli y la zanahoria hasta que estén tiernos pero crujientes.',
        timerSeconds: 240,
      },
      {
        order: 2,
        title: 'Añadir arroz y glaseado',
        instruction:
          'Agrega el arroz frío, la salsa de soya y la miel. Saltea moviendo constantemente hasta que el arroz se dore ligeramente y absorba la salsa.',
        timerSeconds: 180,
      },
      {
        order: 3,
        title: 'Servir caliente',
        instruction:
          'Ajusta de sazón y sirve al momento con semillas de ajonjolí si tienes a la mano.',
      },
    ],
  },
];

export function getRecipesByCookbook(slug: string): Recipe[] {
  return RECIPES.filter((recipe) => recipe.cookbookSlug === slug);
}

export function getRecipeById(id: string): Recipe | undefined {
  return RECIPES.find((recipe) => recipe.id === id);
}
