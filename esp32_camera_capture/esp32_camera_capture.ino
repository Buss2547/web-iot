#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// =========================================================================
// Vigil Web-IoT Face Recognition & Person Classification System
// Hardware: DFRobot ESP32-S3 AI Camera (OV3660)
// Endpoints:
//   - GET /        : ดูหน้าสตรีมเบื้องต้น
//   - GET /stream  : MJPEG Real-time Stream สำหรับหน้าเว็บ
//   - GET /capture : ถ่ายภาพ Single Snapshot JPEG ความเร็วสูงสำหรับ AI / YOLO
//   - GET /status  : รายงานสถานะกล้อง, WiFi RSSI, Heap memory (JSON)
// =========================================================================

// =========================
// WiFi Credentials & Static IP Configuration
// =========================
const char* ssid = "bas";
const char* password = "12345678";

// กำหนด Static IP แบบคงที่ เพื่อไม่ให้ IP เปลี่ยน (http://192.168.137.65)
IPAddress local_IP(192, 168, 137, 65);     // IP ที่ต้องการล็อกให้ ESP32
IPAddress gateway(192, 168, 137, 1);       // Gateway (IP เครื่องปล่อย Hotspot / Router)
IPAddress subnet(255, 255, 255, 0);        // Subnet Mask
IPAddress primaryDNS(192, 168, 137, 1);    // Primary DNS
IPAddress secondaryDNS(8, 8, 8, 8);        // Secondary DNS (Google DNS)

// =========================
// DFRobot ESP32-S3 AI Camera Pinout (OV3660)
// =========================
#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1

#define XCLK_GPIO_NUM      5
#define SIOD_GPIO_NUM      8
#define SIOC_GPIO_NUM      9

#define Y9_GPIO_NUM        4
#define Y8_GPIO_NUM        6
#define Y7_GPIO_NUM        7
#define Y6_GPIO_NUM       14
#define Y5_GPIO_NUM       17
#define Y4_GPIO_NUM       21
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM       16

#define VSYNC_GPIO_NUM     1
#define HREF_GPIO_NUM      2
#define PCLK_GPIO_NUM     15

WebServer server(80);

// =========================
// หน้าเว็บมอนิเตอร์บนกล้อง
// =========================
void handleRoot() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESP32-S3 AI Camera — Vigil Web-IoT</title>

<style>
body {
  margin: 0;
  background: #0f1115;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-align: center;
  padding: 20px 10px;
}

h1 {
  margin: 10px 0;
  font-size: 24px;
  color: #f5c9a8;
}

p {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 20px;
}

.stream-card {
  display: inline-block;
  background: #1e222b;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: 1px solid #334155;
  max-width: 95%;
}

img {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 12px;
  display: block;
}

.btn-group {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

a.btn {
  background: #f5c9a8;
  color: #111;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 13px;
}

a.btn:hover {
  background: #e8b48a;
}
</style>

</head>

<body>

<h1>Vigil ESP32-S3 AI Camera Node</h1>
<p>OV3660 Camera Sensor • Connected to YOLOv8 Person Classification Pipeline</p>

<div class="stream-card">
  <img src="/stream" alt="Live Stream">
  <div class="btn-group">
    <a href="/capture" target="_blank" class="btn">Capture Snapshot (/capture)</a>
    <a href="/status" target="_blank" class="btn">Telemetry Status (/status)</a>
  </div>
</div>

</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

// =========================
// OPTIONS Preflight Handler (CORS & Private Network Access)
// =========================
void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Private-Network", "true");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
  server.send(204);
}

// =========================
// MJPEG Real-time Stream
// =========================
void handleStream() {
  WiFiClient client = server.client();

  String response =
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n"
    "Access-Control-Allow-Origin: *\r\n"
    "Access-Control-Allow-Private-Network: true\r\n"
    "\r\n";

  client.print(response);

  while (client.connected()) {
    camera_fb_t *fb = esp_camera_fb_get();

    if (!fb) {
      Serial.println("Camera stream frame capture failed");
      break;
    }

    client.print("--frame\r\n");
    client.print("Content-Type: image/jpeg\r\n");
    client.print("Content-Length: ");
    client.print(fb->len);
    client.print("\r\n\r\n");

    client.write(fb->buf, fb->len);
    client.print("\r\n");

    esp_camera_fb_return(fb);

    delay(30);
  }
}

// =========================================================
// Single Snapshot JPEG (สำหรับ FastAPI Backend & YOLO Analysis)
// =========================================================
void handleCapture() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Capture snapshot failed");
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  // CORS & PNA Headers เพื่อให้ Frontend เข้าถึงได้โดยตรงไม่ติดบล็อกเบราว์เซอร์
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Private-Network", "true");
  server.sendHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "*");
  server.send_P(200, "image/jpeg", (const char *)fb->buf, fb->len);

  esp_camera_fb_return(fb);
}

// =========================================================
// Telemetry Status JSON (สำหรับแสดงผลข้อมูลกล้องใน Dashboard)
// =========================================================
void handleStatus() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Private-Network", "true");
  String json = "{";
  json += "\"status\":\"online\",";
  json += "\"board\":\"DFRobot ESP32-S3 AI Camera\",";
  json += "\"sensor\":\"OV3660\",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"free_heap\":" + String(ESP.getFreeHeap()) + ",";
  json += "\"psram\":" + String(psramFound() ? "true" : "false");
  json += "}";
  server.send(200, "application/json", json);
}

// =========================
// Camera Setup
// =========================
bool initCamera() {
  camera_config_t config;

  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;

  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;

  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;

  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;

  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;

  // JPEG สำหรับ Web Stream และ Single Capture
  config.pixel_format = PIXFORMAT_JPEG;

  // เริ่มจาก VGA (640x480) หรือ SVGA (800x600) เพื่อความเสถียรและรวดเร็ว
  config.frame_size = FRAMESIZE_VGA;

  // JPEG quality (ค่ายิ่งน้อย = ภาพละเอียดขึ้น)
  config.jpeg_quality = 12;

  // ใช้ PSRAM
  config.fb_location = CAMERA_FB_IN_PSRAM;

  // 2 Frame Buffer สำหรับการสตรีมที่ลื่นไหล
  config.fb_count = 2;

  config.grab_mode = CAMERA_GRAB_LATEST;

  Serial.println("Initializing camera...");

  esp_err_t err = esp_camera_init(&config);

  if (err != ESP_OK) {
    Serial.print("Camera init failed. Error = 0x");
    Serial.println(err, HEX);
    return false;
  }

  Serial.println("Camera initialized successfully!");

  // ปรับจูนเซนเซอร์ OV3660
  sensor_t *s = esp_camera_sensor_get();
  if (s != NULL) {
    s->set_vflip(s, 1);
    s->set_brightness(s, 1);
    s->set_saturation(s, -2);
  }

  return true;
}

// =========================
// SETUP
// =========================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==========================================");
  Serial.println("Vigil ESP32-S3 AI Camera OV3660 Node");
  Serial.println("Connected to YOLOv8 Classification System");
  Serial.println("==========================================");

  // ตรวจสอบ PSRAM
  if (psramFound()) {
    Serial.println("PSRAM: OK (Available)");
  } else {
    Serial.println("PSRAM: NOT FOUND (Performance reduced)");
  }

  // Camera Initialization
  if (!initCamera()) {
    Serial.println("Camera initialization failed! Restarting in 3 seconds...");
    delay(3000);
    ESP.restart();
  }

  // WiFi Connection (กำหนด Static IP ให้กล้องเป็น 192.168.137.65 แบบถาวร)
  WiFi.mode(WIFI_STA);
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("Warning: Static IP configuration failed! Falling back to DHCP...");
  } else {
    Serial.println("Static IP configured: 192.168.137.65");
  }

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected successfully!");
  Serial.print("ESP32-CAM IP Address: ");
  Serial.println(WiFi.localIP());

  // Web Endpoints
  server.on("/", HTTP_GET, handleRoot);
  server.on("/stream", HTTP_GET, handleStream);
  server.on("/stream", HTTP_OPTIONS, handleOptions);
  server.on("/capture", HTTP_GET, handleCapture);
  server.on("/capture", HTTP_OPTIONS, handleOptions);
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/status", HTTP_OPTIONS, handleOptions);

  server.begin();

  Serial.println("HTTP Server started!");
  Serial.println();
  Serial.print("Live MJPEG Stream: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");
  Serial.print("Single Snapshot Capture: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/capture");
}

// =========================
// LOOP
// =========================
void loop() {
  server.handleClient();
}