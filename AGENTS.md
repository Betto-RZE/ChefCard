# AGENTS.md — Guía de Desarrollo para ChefCard

Este documento define el contexto operativo, las convenciones técnicas y las reglas obligatorias para cualquier agente que trabaje en el repositorio **ChefCard**.

## 1. Contexto Rápido del Proyecto
- **Qué es:** Aplicación web *mobile-first* (PWA) que funciona como asistente personal de cocina activado mediante **tarjetas físicas RFID 13.56 MHz (S50)** leídas por una estación **ESP32 + módulo RC522** conectada por Wi-Fi a la app abierta en el celular (**iPhone** / Android).
- **Arquitectura:** Frontend PWA + puente SSE ligero integrado en Vite (`rfidBridgePlugin.ts`, sin bases de datos ni backend remoto). Catálogo en TypeScript local y estado persistido en `localStorage` con Zustand.
- **Referencias obligatorias:**
  - Lee `CONTEXTO.md` para visión, flujo de usuario y alcance funcional.
  - Lee `ARQUITECTURA.md` para estructura de carpetas, rutas y contratos de módulos.
  - Lee `firmware/README.md` para detalles de hardware (ESP32 + RC522).

---

## 2. Stack Tecnológico Oficial
- **Gestor de paquetes:** `pnpm` (no mezclar con `npm` ni generar `package-lock.json`).
- **Runtime / Bundler:** Vite + React + TypeScript (modo estricto).
- **Puente Hardware:** `rfidBridgePlugin.ts` (middleware SSE en Vite: `/api/rfid-scan`, `/api/rfid-stream`, `/api/rfid-status`).
- **Firmware:** Arduino C++ en `firmware/chefcard_rfid/chefcard_rfid.ino` (`MFRC522` + `WiFi` + `HTTPClient`).
- **Rutas:** `react-router-dom` (`BrowserRouter`, con fallback SPA en `vercel.json`).
- **Estilos:** Tailwind CSS v4 (`@tailwindcss/vite`) + `lucide-react` + `framer-motion`.
- **Estado:** `zustand` con middleware `persist`.
- **PWA:** `vite-plugin-pwa`.

> **Regla:** No introduzcas bases de datos remotas ni servidores externos pesados salvo que el usuario lo solicite explícitamente.

---

## 3. Reglas de Desarrollo Mobile-First
1. **Diseño pensado para celular primero (iPhone / Android):**
   - Contenedor principal optimizado para móvil (`max-w-md mx-auto min-h-dvh`), limpio y centrado en escritorio.
   - Controles primarios en la zona del pulgar (*thumb zone*) con área táctil mínima de `44x44 px` y soporte `env(safe-area-inset-bottom)`.
   - En **Modo Cocina (`/cook/:id`)**, priorizar tipografía grande, alto contraste, mínima distracción y lectura cómoda a distancia.
2. **Idioma de la interfaz:** Todo el texto visible para el usuario debe estar en **español natural y claro**.
3. **Código e identificadores:** Nombres de archivos, variables, tipos, rutas (`/scan`, `/book/:slug`, `/cook/:id`) y comentarios técnicos en **inglés** o consistentes con `ARQUITECTURA.md`.

---

## 4. Reglas Críticas de Integración RFID (ESP32 + RC522 / Simulador / Web NFC)
1. **Aislamiento:** Toda interacción con `EventSource('/api/rfid-stream')` y `window.NDEFReader` debe vivir exclusivamente dentro de `src/hooks/useNfcReader.ts` y utilidades en `src/utils/nfcParser.ts`. Nunca accedas a SSE o `NDEFReader` directamente desde páginas o componentes visuales.
2. **Degradación elegante (Graceful Degradation):**
   - Si el puente SSE está desconectado (por ejemplo, en un deploy estático sin ESP32), informa claramente el estado y ofrece siempre el **Simulador RFID**.
   - Verifica `'NDEFReader' in window` antes de invocar Web NFC y usa `AbortController` con limpieza al desmontar.
3. **Resolución de tarjetas:**
   - Normaliza siempre los UIDs a mayúsculas con formato `AA:BB:CC:DD` tanto en el firmware ESP32 como en `rfidBridgePlugin.ts` y `nfcParser.ts`.
   - Prioriza: `1) URL NDEF (/book/:slug)` -> `2) Mapa UID en useCardStore` -> `3) Flujo UnknownCardModal para vincular tarjeta nueva`.

---

## 5. Reglas de Modo Cocina y Temporizadores
1. **Temporizadores por timestamp:** Calcula siempre el tiempo restante con `endTime - Date.now()` para resistir suspensión de pestaña o bloqueo de pantalla en iOS/Android.
2. **Alertas sin dependencias externas:** Usa **Web Audio API** (oscilador sintetizado) y `navigator.vibrate` (con verificación de soporte) para que funcionen incluso *offline*.
3. **Wake Lock seguro:** Encapsula `navigator.wakeLock.request('screen')` en `useWakeLock.ts`, manejando `try/catch` y re-solicitando el bloqueo al volver a `document.visibilityState === 'visible'`.

---

## 6. Convenciones de Código y Calidad
- **TypeScript estricto:** Evita `any`. Usa los tipos definidos en `src/types/domain.ts` y `src/types/web-nfc.d.ts`.
- **Componentes pequeños y enfocados:** Separa lógica de hardware/estado (hooks y stores) de presentación (componentes y páginas).

---

## 7. Comandos de Verificación
Antes de dar por terminada cualquier tarea de código, ejecuta y confirma que pasen sin errores:

```bash
pnpm typecheck      # tsc --noEmit
pnpm build          # Compilación de producción + generación de PWA
```
