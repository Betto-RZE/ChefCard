# Guía de Hardware y Firmware — ChefCard (ESP32 + RC522)

## 1. Lista de compras recomendada
De tu tienda de electrónica compra:
- **1× `MÓDULO RFID RC522`** *(13.56 MHz).*
- **3× `TARJETA RFID 13.56 MHz S50`** *(ya las tienes; cada una puede abrir un libro distinto).*
- **Cables jumper** hembra-hembra (o protoboard + macho-hembra) si aún no tienes.

> **NO compres `LLAVERO RFID 125KHZ`:** el módulo RC522 trabaja exclusivamente a **13.56 MHz**.

---

## 2. Diagrama de conexión (RC522 → ESP32)

> **⚠️ MUY IMPORTANTE:** Alimenta el módulo **RC522** únicamente con **3.3V (`3V3`)**. Conectarlo a `5V` puede dañarlo.

| Pin en RC522 | Pin en ESP32 (DevKit V1) | Función |
| :--- | :--- | :--- |
| **3.3V** | **3V3** | Alimentación 3.3V |
| **GND** | **GND** | Tierra |
| **SDA (SS)** | **GPIO 25** | Chip Select SPI |
| **SCK** | **GPIO 26** | Reloj SPI |
| **MOSI** | **GPIO 27** | Datos ESP32 → RC522 |
| **MISO** | **GPIO 32** | Datos RC522 → ESP32 |
| **RST** | **GPIO 33** | Reset |
| **IRQ** | *(sin conectar)* | — |

*(Opcional: el firmware usa automáticamente el **LED azul integrado en GPIO 2** del ESP32 para confirmar cada lectura. Si quieres conectar un buzzer activo, conéctalo a **GPIO 4** y GND, y cambia `USE_BUZZER = true` en el código).*

---

## 3. Pasos para subir el código al ESP32

1. Abre **`firmware/chefcard_rfid/chefcard_rfid.ino`** en **Arduino IDE**.
2. Instala la librería **`MFRC522`** (autor: **GithubCommunity**) desde *Herramientas → Administrar bibliotecas*.
3. Conecta la computadora, el ESP32 y el celular a la misma red Wi-Fi de **2.4 GHz**. Inicia ChefCard en la computadora:
   ```bash
   pnpm dev
   ```
   Anota la dirección **Network** que muestra Vite en tu terminal (ejemplo: `http://192.168.1.45:5173`). También puedes copiar la URL del puente en **Tarjetas** de ChefCard.
4. Edita estas 3 líneas al inicio de `chefcard_rfid.ino`. En `SERVER_URL` usa la IP de la computadora en la red, nunca `localhost`:
   ```cpp
   const char* WIFI_SSID = "TU_NOMBRE_DE_WIFI";         // Red Wi-Fi 2.4 GHz
   const char* WIFI_PASSWORD = "TU_CONTRASEÑA_WIFI";
   const char* SERVER_URL = "http://192.168.1.45:5173/api/rfid-scan";
   ```
5. Selecciona tu placa **ESP32 Dev Module** y puerto COM, y sube el sketch.
6. Abre el **Monitor Serie** a **115200 baudios** para confirmar que conectó al Wi-Fi y detecta el RC522.

---

## 4. Leer y asignar tus tres tarjetas

1. Conecta tu **iPhone** al **mismo Wi-Fi** que tu PC y el ESP32.
2. Abre en Safari la **URL Network de Vite** (por ejemplo `http://192.168.1.45:5173`). “App conectada” confirma la conexión al puente, no el estado físico del RC522.
3. Abre la pestaña **Tarjetas** y acerca una tarjeta S50 al RC522. El firmware muestra el UID en el Monitor Serie y ChefCard abre el diálogo para asignar un libro.
4. Repite con las otras dos tarjetas y elige un libro para cada una. Los vínculos quedan guardados localmente en ese navegador.

Las S50 MIFARE Classic se identifican por su UID: no se escribe una URL NDEF en ellas y el celular no las lee directamente. Si un UID aparece en el Monitor Serie pero no en la app, verifica que `SERVER_URL` apunte a la IP y puerto correctos de Vite y que los tres dispositivos sigan en la misma red.
