/*
 * ChefCard — Firmware Lector RFID (ESP32 + RC522)
 * ------------------------------------------------
 * Lee tarjetas RFID 13.56 MHz (MIFARE Classic S50 / llaveros 13.56 MHz)
 * y envía el UID normalizado (AA:BB:CC:DD) por Wi-Fi al puente local de ChefCard.
 *
 * Librería requerida en Arduino IDE:
 *   - "MFRC522" por GithubCommunity (Gestor de Librerías)
 *
 * Conexión RC522 -> ESP32 (¡SIEMPRE A 3.3V, NUNCA 5V!):
 *   RC522 3.3V  -> ESP32 3V3
 *   RC522 GND   -> ESP32 GND
 *   RC522 SDA   -> ESP32 GPIO 5
 *   RC522 SCK   -> ESP32 GPIO 18
 *   RC522 MOSI  -> ESP32 GPIO 23
 *   RC522 MISO  -> ESP32 GPIO 19
 *   RC522 RST   -> ESP32 GPIO 22
 *   RC522 IRQ   -> (sin conectar)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

// ===================== CONFIGURACIÓN =====================
// IMPORTANTE: El ESP32 solo se conecta a redes Wi-Fi de 2.4 GHz
const char* WIFI_SSID = "TU_NOMBRE_DE_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASEÑA_WIFI";

// Cambia la IP por la que muestra tu PC al ejecutar `pnpm dev`
// Ejemplo: http://192.168.1.45:5173/api/rfid-scan
const char* SERVER_URL = "http://192.168.1.100:5173/api/rfid-scan";

// Pines del módulo RC522 (VSPI estándar en ESP32)
constexpr uint8_t SS_PIN = 5;
constexpr uint8_t RST_PIN = 22;

// Feedback visual/sonoro opcional
constexpr uint8_t LED_PIN = 2;       // LED azul integrado en la mayoría de ESP32
constexpr bool USE_BUZZER = false;   // Cambia a true si conectas un buzzer en GPIO 4
constexpr uint8_t BUZZER_PIN = 4;

// Tiempo mínimo (ms) antes de volver a enviar la misma tarjeta
constexpr unsigned long DEBOUNCE_MS = 2500;
// =========================================================

MFRC522 mfrc522(SS_PIN, RST_PIN);

String lastSentUid = "";
unsigned long lastSentAt = 0;

void blinkFeedback(uint8_t times, uint16_t durationMs = 90) {
  for (uint8_t i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    if (USE_BUZZER) {
      digitalWrite(BUZZER_PIN, HIGH);
    }
    delay(durationMs);
    digitalWrite(LED_PIN, LOW);
    if (USE_BUZZER) {
      digitalWrite(BUZZER_PIN, LOW);
    }
    if (i + 1 < times) {
      delay(80);
    }
  }
}

String formatUid(const MFRC522::Uid& uid) {
  String result = "";
  for (byte i = 0; i < uid.size; i++) {
    if (i > 0) {
      result += ":";
    }
    if (uid.uidByte[i] < 0x10) {
      result += "0";
    }
    result += String(uid.uidByte[i], HEX);
  }
  result.toUpperCase();
  return result;
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.print("Conectando a Wi-Fi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint8_t attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(400);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi conectado! IP del ESP32: ");
    Serial.println(WiFi.localIP());
    blinkFeedback(2, 100);
  } else {
    Serial.println("No se pudo conectar al Wi-Fi. Reintentando en el próximo ciclo...");
  }
}

void sendUidToChefCard(const String& uid) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Sin Wi-Fi: no se pudo enviar el UID.");
      return;
    }
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000);

  String payload = "{\"uid\":\"" + uid + "\",\"device\":\"esp32-rc522\"}";
  int httpCode = http.POST(payload);

  if (httpCode > 0) {
    Serial.print("Enviado a ChefCard [HTTP ");
    Serial.print(httpCode);
    Serial.print("]: ");
    Serial.println(http.getString());
    if (httpCode >= 200 && httpCode < 300) {
      blinkFeedback(1, 120);
    } else {
      blinkFeedback(3, 60);
    }
  } else {
    Serial.print("Error enviando a ChefCard: ");
    Serial.println(http.errorToString(httpCode));
    blinkFeedback(3, 60);
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(300);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  if (USE_BUZZER) {
    pinMode(BUZZER_PIN, OUTPUT);
    digitalWrite(BUZZER_PIN, LOW);
  }

  SPI.begin();
  mfrc522.PCD_Init();
  delay(50);

  Serial.println("\n=== ChefCard Lector RFID (ESP32 + RC522) ===");
  mfrc522.PCD_DumpVersionToSerial();

  connectWiFi();
  Serial.println("Listo. Acerca una tarjeta RFID 13.56 MHz (S50)...");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  String uid = formatUid(mfrc522.uid);
  unsigned long now = millis();

  if (uid != lastSentUid || (now - lastSentAt) > DEBOUNCE_MS) {
    lastSentUid = uid;
    lastSentAt = now;

    Serial.print("Tarjeta detectada -> UID: ");
    Serial.println(uid);
    sendUidToChefCard(uid);
  }

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}
