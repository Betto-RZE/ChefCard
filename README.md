# ChefCard 🍳💳

**ChefCard** es una aplicación web *mobile-first* (PWA) que funciona como asistente personal de cocina activado mediante **tarjetas físicas RFID 13.56 MHz (S50)** leídas con un **ESP32 + módulo RC522** y sincronizadas en tiempo real con tu **iPhone** (o cualquier smartphone).

> **Sin bases de datos ni servidores externos:** incluye un puente en tiempo real integrado en Vite para el ESP32 y un **Simulador RFID** para probar incluso sin hardware conectado.

---

## Requisitos previos

- **Node.js** `v20` o superior
- **pnpm** `v9+`

Puedes verificarlo en tu terminal con:
```bash
node -v
pnpm -v
```

---

## Inicio rápido (3 pasos)

### 1. Entra a la carpeta del proyecto
```bash
cd ChefCard
```

### 2. Instala las dependencias
```bash
pnpm install
```

### 3. Inicia la app (lista para PC, iPhone y ESP32)
```bash
pnpm dev
```

Vite mostrará dos direcciones:
- **Local (PC):** `http://localhost:5173`
- **Network (iPhone y ESP32 en el mismo Wi-Fi):** `http://192.168.x.x:5173`

> **Tip:** Abre la URL **Network** en Safari de tu **iPhone** para ver el indicador verde **"ESP32 listo"**.

---

## Comandos disponibles

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev` | Inicia desarrollo en red local (`host: true`) + puente RFID (`/api/rfid-scan` y `/api/rfid-stream`) |
| `pnpm typecheck` | Verifica los tipos de TypeScript (`tsc --noEmit`) |
| `pnpm build` | Valida tipos y genera la compilación de producción + PWA en `dist/` |
| `pnpm preview` | Previsualiza la build de producción (también con puente RFID activo) |

---

## Conectar tu estación física ESP32 + RC522

Consulta la guía completa de compras, pines y carga en Arduino IDE en **[firmware/README.md](./firmware/README.md)**.

Resumen rápido:
1. Conecta el **RC522** al **ESP32** alimentado a **3.3V** (nunca 5V).
2. Abre **[firmware/chefcard_rfid/chefcard_rfid.ino](./firmware/chefcard_rfid/chefcard_rfid.ino)** en Arduino IDE.
3. Coloca tu Wi-Fi **2.4 GHz** y la URL `http://<IP-DE-TU-PC>:5173/api/rfid-scan` (puedes copiarla directo desde la pestaña **Tarjetas** en ChefCard).
4. Sube el sketch al ESP32, abre ChefCard en tu iPhone y acerca tus tarjetas físicas **13.56 MHz S50** al lector RC522.

> **¿Aún no conectas el ESP32?** Puedes probar hoy mismo el puente HTTP completo desde la pestaña **Tarjetas** con el botón **"Probar puente HTTP"** o usando el **Simulador RFID**.

---

## Documentación del proyecto

- [CONTEXTO.md](./CONTEXTO.md) — Visión del producto, flujo de usuario y alcance del MVP.
- [ARQUITECTURA.md](./ARQUITECTURA.md) — Estructura de carpetas, diagrama ESP32 ↔ SSE ↔ Mobile y contratos.
- [AGENTS.md](./AGENTS.md) — Convenciones técnicas y reglas de desarrollo.
- [firmware/README.md](./firmware/README.md) — Lista de compras, cableado RC522 → ESP32 y pasos en Arduino IDE.
