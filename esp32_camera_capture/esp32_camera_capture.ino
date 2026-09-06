#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// =========================
// WiFi
// =========================
const char* ssid = "Basthanakorn";
const char* password = "25472547z";

// =========================
// DFRobot ESP32-S3 AI Camera
// OV3660
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
// หน้าเว็บ
// =========================
void handleRoot() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESP32-S3 AI Camera</title>

<style>
body {
  margin: 0;
  background: #111;
  color: white;
  font-family: Arial;
  text-align: center;
}

h1 {
  margin: 20px;
}

img {
  width: 95%;
  max-width: 1000px;
  height: auto;
  border-radius: 10px;
}
</style>

</head>

<body>

<h1>ESP32-S3 AI Camera</h1>

<img src="/stream">

</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

// =========================
// MJPEG Stream
// =========================
void handleStream() {

  WiFiClient client = server.client();

  String response =
    "HTTP/1.1 200 OK\r\n"
    "Content-Type: multipart/x-mixed-replace; boundary=frame\r\n"
    "Access-Control-Allow-Origin: *\r\n"
    "\r\n";

  client.print(response);

  while (client.connected()) {

    camera_fb_t *fb = esp_camera_fb_get();

    if (!fb) {
      Serial.println("Camera capture failed");
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

  // JPEG สำหรับ Web Stream
  config.pixel_format = PIXFORMAT_JPEG;

  // เริ่มจาก VGA เพื่อให้ทดสอบง่ายและลื่น
  config.frame_size = FRAMESIZE_VGA;

  // JPEG quality
  // ค่ายิ่งน้อย = ภาพละเอียดขึ้น แต่ไฟล์ใหญ่ขึ้น
  config.jpeg_quality = 12;

  // ใช้ PSRAM
  config.fb_location = CAMERA_FB_IN_PSRAM;

  // 2 Frame Buffer
  config.fb_count = 2;

  config.grab_mode = CAMERA_GRAB_LATEST;

  Serial.println("Initializing camera...");

  esp_err_t err = esp_camera_init(&config);

  if (err != ESP_OK) {

    Serial.print("Camera init failed. Error = 0x");
    Serial.println(err, HEX);

    return false;
  }

  Serial.println("Camera initialized!");

  // ปรับ OV3660
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
  Serial.println("==============================");
  Serial.println("DFRobot ESP32-S3 AI Camera");
  Serial.println("==============================");

  // ตรวจ PSRAM
  if (psramFound()) {
    Serial.println("PSRAM: OK");
  } else {
    Serial.println("PSRAM: NOT FOUND");
  }

  // Camera
  if (!initCamera()) {

    Serial.println("Camera ERROR!");
    Serial.println("Restarting...");

    delay(3000);
    ESP.restart();
  }

  // WiFi
  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected!");

  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Web
  server.on("/", HTTP_GET, handleRoot);
  server.on("/stream", HTTP_GET, handleStream);

  server.begin();

  Serial.println("Web server started!");
  Serial.println();
  Serial.print("Open browser: http://");
  Serial.println(WiFi.localIP());
}

// =========================
// LOOP
// =========================
void loop() {

  server.handleClient();

}