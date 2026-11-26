# Guía de Hardware y Firmware — ChefCard (ESP32 + RC522)

## 1. Lista de compras recomendada
De tu tienda de electrónica compra:
- **1× `MODULO RFID RC522`** *(13.56 MHz — suele incluir 1 tarjeta blanca y 1 llavero azul).*
- **2 o 3× `TARJETA RFID 13.56MHZ S50`** extra *(para tener 4 tarjetas físicas, una por cada libro de cocina).*
- **Cables jumper** hembra-hembra (o protoboard + macho-hembra) si aún no tienes.

> **NO compres `LLAVERO RFID 125KHZ`:** el módulo RC522 trabaja exclusivamente a **13.56 MHz**.

---

## 2. Diagrama de conexión (RC522 → ESP32)

> **⚠️ MUY IMPORTANTE:** Alimenta el módulo **RC522** únicamente con **3.3V (`3V3`)**. Conectarlo a `5V` puede dañarlo.

| Pin en RC522 | Pin en ESP32 (DevKit V1) | Función |
| :--- | :--- | :--- |
| **3.3V** | **3V3** | Alimentación 3.3V |
| **GND** | **GND** | Tierra |
| **SDA (SS)** | **GPIO 5** | Chip Select SPI |
| **SCK** | **GPIO 18** | Reloj SPI |
| **MOSI** | **GPIO 23** | Datos ESP32 → RC522 |
| **MISO** | **GPIO 19** | Datos RC522 → ESP32 |
| **RST** | **GPIO 22** | Reset |
| **IRQ** | *(sin conectar)* | — |

*(Opcional: el firmware usa automáticamente el **LED azul integrado en GPIO 2** del ESP32 para confirmar cada lectura. Si quieres conectar un buzzer activo, conéctalo a **GPIO 4** y GND, y cambia `USE_BUZZER = true` en el código).*

---

## 3. Pasos para subir el código al ESP32

1. Abre **`firmware/chefcard_rfid/chefcard_rfid.ino`** en **Arduino IDE**.
2. Instala la librería **`MFRC522`** (autor: **GithubCommunity**) desde *Herramientas → Administrar bibliotecas*.
3. Inicia ChefCard en tu PC:
   ```bash
   pnpm dev
   ```
   Anota la dirección **Network** que muestra Vite en tu terminal (ejemplo: `http://192.168.1.45:5173`).
4. Edita estas 3 líneas al inicio de `chefcard_rfid.ino`:
   ```cpp
   const char* WIFI_SSID = "TU_NOMBRE_DE_WIFI";         // Red Wi-Fi 2.4 GHz
   const char* WIFI_PASSWORD = "TU_CONTRASEÑA_WIFI";
   const char* SERVER_URL = "http://192.168.1.45:5173/api/rfid-scan";
   ```
5. Selecciona tu placa **ESP32 Dev Module** y puerto COM, y sube el sketch.
6. Abre el **Monitor Serie** a **115200 baudios** para confirmar que conectó al Wi-Fi y detecta el RC522.

---

## 4. Prueba en tu iPhone (30 segundos)

1. Conecta tu **iPhone** al **mismo Wi-Fi** que tu PC y el ESP32.
2. Abre **`http://192.168.1.45:5173`** en Safari (verás el indicador verde **"ESP32 listo"**).
3. Acerca una tarjeta blanca **S50** al módulo **RC522**:
   - El LED del ESP32 parpadeará.
   - En tu **iPhone** aparecerá automáticamente el modal **"Tarjeta nueva detectada"** con el UID real de tu tarjeta.
   - Elige el libro de cocina (ej. *Cocina Vegana*), guarda el vínculo y **la próxima vez que acerques esa tarjeta, el libro se abrirá al instante**.
