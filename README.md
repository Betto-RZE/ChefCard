# ChefCard 🍳💳

ChefCard convierte tarjetas RFID físicas en accesos directos a libros de recetas. Acerca una tarjeta a un lector **RC522** conectado a un **ESP32** y el libro vinculado se abre en ChefCard desde el celular. La aplicación también ayuda a explorar recetas y, conforme se completa el flujo de cocina, preparar ingredientes y seguir instrucciones paso a paso.

Está pensada para usarse en la cocina desde el teléfono. No requiere cuentas ni una base de datos en la nube: el catálogo se incluye en la app y los vínculos entre tarjetas y libros se guardan localmente en el navegador.

## Cómo funciona

```text
Tarjeta RFID 13.56 MHz
        ↓ lectura del UID
RC522 conectado al ESP32
        ↓ Wi-Fi, HTTP POST /api/rfid-scan
Puente local de Vite en la computadora
        ↓ evento en tiempo real (SSE)
ChefCard abierta en el celular
        ↓
Libro de recetas vinculado a esa tarjeta
```

1. El RC522 lee el UID único de la tarjeta **MIFARE Classic S50 de 13.56 MHz**. No hay que programar la tarjeta ni guardar una URL en ella.
2. El ESP32 envía ese UID por Wi-Fi al puente local que se inicia junto con Vite.
3. El puente transmite la lectura al navegador que tiene ChefCard abierta.
4. Si la tarjeta ya está vinculada, ChefCard abre el libro correspondiente. Si es nueva, permite elegir un libro y guardar el vínculo.

La computadora que ejecuta Vite, el ESP32 y el celular deben poder comunicarse por la misma red local. El lector RC522 trabaja a **3.3 V**; no lo alimentes con 5 V.

## Qué incluye

- Una pantalla de bienvenida y una experiencia optimizada para celular.
- Un catálogo local de libros de cocina y recetas.
- Lectura de tarjetas físicas mediante ESP32 + RC522.
- Vinculación y administración de UID de tarjetas con libros.
- Un puente local de Vite con los endpoints `POST /api/rfid-scan`, `GET /api/rfid-stream` y `GET /api/rfid-status`.
- Una PWA que se puede instalar desde un navegador compatible.

Los vínculos y algunos datos de uso se guardan en `localStorage` del navegador. Por ello, cada celular conserva sus propios vínculos; abrir la app en otro dispositivo no copia automáticamente sus datos.

## Requisitos

- Node.js 20 o superior.
- pnpm (la versión indicada por `package.json` / Corepack).
- Para usar el lector físico: ESP32 con Wi-Fi, módulo RC522 y tarjetas RFID MIFARE Classic S50 de 13.56 MHz.
- Para usar el celular y el lector: computadora, celular y ESP32 conectados a una red local que permita la comunicación entre dispositivos.

## Inicio rápido

```bash
git clone https://github.com/Betto-RZE/ChefCard.git
cd ChefCard
pnpm install
pnpm dev
```

Abre en la computadora la dirección `Local` que muestra Vite. En el celular, abre la dirección `Network` que muestra la terminal. Usa la dirección de red de la computadora en la configuración del firmware para que el ESP32 pueda enviar las lecturas.

> Si el celular o el ESP32 no pueden conectarse, revisa que estén en la misma red y que el firewall de la computadora permita Node.js/Vite en redes privadas.

## Conectar el ESP32 y el RC522

La guía de hardware contiene el cableado de cada pin, los pasos de Arduino IDE y la configuración del Wi-Fi:

- [Guía de conexión y firmware](./firmware/README.md)
- [Sketch para Arduino IDE](./firmware/chefcard_rfid/chefcard_rfid.ino)

Configura en el sketch la red Wi-Fi de 2.4 GHz y la URL del puente con la IP local de la computadora, por ejemplo:

```cpp
http://192.168.1.50:5173/api/rfid-scan
```

La dirección es solo un ejemplo: utiliza la IP que Vite muestra en tu propia red. Carga el sketch al ESP32, deja `pnpm dev` ejecutándose y abre ChefCard en el celular antes de acercar una tarjeta.

## Comandos

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia la app y el puente RFID local para desarrollo. |
| `pnpm typecheck` | Comprueba los tipos de TypeScript. |
| `pnpm build` | Ejecuta TypeScript y genera la compilación de producción y la PWA. |
| `pnpm preview` | Sirve localmente la compilación generada. |

## Tecnologías

React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Framer Motion, Lucide y `vite-plugin-pwa`. El puente RFID se implementa como plugin de Vite; no hay un servicio backend remoto.

## Documentación

- [CONTEXTO.md](./CONTEXTO.md): propósito, flujo de usuario y alcance del producto.
- [ARQUITECTURA.md](./ARQUITECTURA.md): componentes, rutas y protocolo RFID.
- [firmware/README.md](./firmware/README.md): hardware, cableado y firmware.
- [AGENTS.md](./AGENTS.md): convenciones de desarrollo del repositorio.
