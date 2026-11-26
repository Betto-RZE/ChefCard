# ChefCard — Documento de Contexto del Proyecto

## 1. Visión General
**ChefCard** es una aplicación web *mobile-first* (PWA) que funciona como un **asistente personal de cocina**. Su objetivo es facilitar la preparación de alimentos mediante recetas digitales interactivas, instrucciones paso a paso, temporizadores integrados y seguimiento del proceso de preparación.

El proyecto también tiene como meta práctica **conectar un lector físico RFID real (ESP32 + RC522 con tarjetas 13.56 MHz S50)** directamente con la aplicación web abierta en un smartphone (**iPhone / Android**), manteniendo una arquitectura ultraligera sin bases de datos ni servidores en la nube.

---

## 2. Propuesta de Valor y Problema que Resuelve
- **Problema:** Al cocinar, buscar recetas manualmente entre decenas de opciones, desbloquear el celular con las manos ocupadas y manejar múltiples temporizadores genera fricción.
- **Solución:** Una **estación física de cocina ChefCard**. Cada tarjeta física RFID representa un **libro de cocina temático**. Al acercar la tarjeta al lector RC522 junto a tu celular, ChefCard identifica el libro y prepara toda la experiencia de cocina al instante.

---

## 3. Integración con Tarjetas Físicas RFID (ESP32 + RC522 + Mobile)

### Hardware objetivo
- **Lector RFID:** Módulo **RC522 (13.56 MHz)** conectado a un **ESP32** con Wi-Fi.
- **Tarjetas físicas:** Tarjetas PVC **RFID 13.56 MHz MIFARE Classic S50** (y/o llaveros 13.56 MHz).
  > *Nota:* El módulo RC522 trabaja exclusivamente a **13.56 MHz** (no lee tarjetas/llaveros de 125 kHz).
- **Pantalla del usuario:** Smartphone (**iPhone** o Android) ejecutando la web app ChefCard en el mismo Wi-Fi.

### Estrategia de lectura en tiempo real
ChefCard centraliza todas las fuentes de lectura en un único flujo unificado:

1. **Estación ESP32 + RC522 (Flujo principal de hardware):**
   - El ESP32 lee el **UID** real de la tarjeta S50 (`AA:BB:CC:DD`) y envía un `POST /api/rfid-scan` por Wi-Fi al puente local integrado en Vite (`pnpm dev`).
   - El puente retransmite el evento en tiempo real vía **Server-Sent Events (`/api/rfid-stream`)** a Safari en el iPhone (o cualquier navegador conectado).
   - Al recibir el UID, ChefCard abre el libro vinculado o muestra el diálogo para vincular la tarjeta nueva en un toque.
2. **Simulador RFID integrado (Desarrollo sin hardware):**
   - Permite emular tarjetas físicas desde PC o celular pasando por exactamente el mismo flujo de resolución y persistencia.
3. **Web NFC / URL NDEF (Soporte opcional):**
   - Compatible de forma adicional con Chrome Android (`NDEFReader`) y rutas directas `/book/:slug`.

### Ejemplos de tarjetas y libros
| Tarjeta Física S50 | Slug / Ruta | Libro de Cocina |
| :--- | :--- | :--- |
| Tarjeta #01 | `/book/cocina-vegana` | **Cocina Vegana** |
| Tarjeta #02 | `/book/carnes-frias` | **Carnes Frías y Tablas** |
| Tarjeta #03 | `/book/postres` | **Postres y Repostería** |
| Tarjeta #04 | `/book/cocina-rapida` | **Cocina Rápida (< 20 min)** |

---

## 4. Arquitectura y Stack Tecnológico (Frontend PWA + Puente Local ESP32)

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Hardware RFID** | **ESP32 + RC522 + Tarjetas S50** | Lectura física de UID 13.56 MHz y envío por Wi-Fi (`HTTP POST`) |
| **Puente en tiempo real** | **Plugin Vite SSE (`rfidBridgePlugin.ts`)** | Recibe `/api/rfid-scan` del ESP32 y notifica al iPhone por `/api/rfid-stream` sin backend externo |
| **Frontend** | **Vite + React + TypeScript + `pnpm`** | SPA *mobile-first* rápida, ligera y tipada |
| **Enrutamiento** | **React Router** | Rutas `/`, `/scan`, `/book/:slug`, `/recipe/:id`, `/cook/:id`, `/cards` |
| **Estilos & UI** | **Tailwind CSS v4 + Lucide React + Framer Motion** | Diseño móvil ergonómico, animaciones de escaneo y gestos *swipe* |
| **Estado y Datos** | **Zustand + `localStorage`** | Persistencia de vínculos `UID ↔ Libro`, historial, checklist y timers |
| **PWA / APIs Web** | **`vite-plugin-pwa`, Wake Lock, Web Audio, Vibration** | Instalable en celular, pantalla activa y alertas de temporizador |

---

## 5. Flujo Principal del Usuario (User Journey)

1. **Bienvenida (`/`)**
   - Pantalla inicial de presentación con acceso directo al lector (`/scan`) o al simulador.
2. **Lector RFID (`/scan`)**
   - Escucha en tiempo real las lecturas del **ESP32 + RC522** (con indicador verde *"ESP32 listo"*), ofrece el **Simulador RFID** y muestra la galería de libros.
3. **Vista de Libro de Cocina (`/book/:slug`)**
   - Se abre automáticamente al pasar una tarjeta por el RC522, mostrando identidad visual del libro y sus recetas.
4. **Detalle de Receta y *Mise en Place* (`/recipe/:id`)**
   - Selector dinámico de porciones y checklist interactivo de ingredientes.
5. **Modo Cocina Paso a Paso (`/cook/:id`)**
   - Un paso a la vez con tipografía grande, temporizadores simultáneos basados en `endTime`, alertas sonoras/vibración y *Wake Lock*.
6. **Gestor de Tarjetas (`/cards`)**
   - Muestra el estado del puente ESP32, la URL `SERVER_URL`, un botón de prueba HTTP end-to-end, gestión de vínculos `UID ↔ Libro` e historial de escaneos.

---

## 6. Alcance del MVP (Checklist de Desarrollo)

- [x] Inicializar proyecto con Vite + React + TypeScript + Tailwind CSS v4 + PWA (`pnpm`).
- [x] Crear dataset inicial de 4 libros de cocina y 8 recetas completas.
- [x] Implementar puente en tiempo real **ESP32 → Vite SSE → iPhone** (`rfidBridgePlugin.ts`) y firmware listo en `firmware/chefcard_rfid/chefcard_rfid.ino`.
- [x] Implementar hook unificado `useNfcReader` (receptor SSE del ESP32 + simulador RFID + soporte opcional Web NFC).
- [x] Construir pantalla de Bienvenida (`/`), Lector (`/scan`), Libro (`/book/:slug`) y Gestor de Tarjetas (`/cards`) con vinculación de tarjetas nuevas.
- [ ] Construir pantalla de **Detalle de Receta (`/recipe/:id`)** con escalador de porciones y checklist de ingredientes.
- [ ] Construir **Modo Cocina (`/cook/:id`)** paso a paso con barra de progreso, múltiples temporizadores persistentes (`endTime`), alertas sonoras y `Wake Lock`.
