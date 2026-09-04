/*
  ESP32-S3 AI Camera (DFRobot DFR1154 v1.1)
  High Quality WiFi Webcam - MJPEG Stream for Vigil Security System

  Sensor: OV3660
  Resolution : SVGA 800x600 (High FPS & Stable Stream)
  JPEG Quality : 10
*/

#include "esp_camera.h"
#include "esp_http_server.h"
#include <WiFi.h>

// =====================================================
// WIFI & STATIC IP CONFIGURATION (ตั้งค่า WiFi และ IP คงที่)
// =====================================================
// ใส่ชื่อ WiFi และรหัสผ่านตรงนี้ (เช่น Windows Mobile Hotspot หรือ WiFi บ้าน)
const char* WIFI_SSID     = "bas";       // <-- ใส่ชื่อ WiFi / Hotspot ตรงนี้
const char* WIFI_PASSWORD = "12345678";  // <-- ใส่รหัสผ่าน WiFi ตรงนี้

// กำหนดว่าต้องการล็อก IP ไม่ให้เปลี่ยนแปลงหรือไม่ (true = ล็อก IP คงที่, false = รับจาก DHCP อัตโนมัติ)
const bool USE_STATIC_IP  = true;

// ตั้งค่า IP แบบคงที่ (Static IP) เพื่อไม่ให้ IP เปลี่ยนแปลง:
// (ค่าเริ่มต้น 192.168.137.112 สำหรับ Windows Mobile Hotspot ซึ่งตรงกับระบบเว็บ detection.js ทันที)
IPAddress STATIC_IP     (192, 168, 137, 112); // <-- IP ของกล้อง ESP32 ที่ต้องการล็อก
IPAddress GATEWAY       (192, 168, 137, 1);   // <-- Gateway (IP ของคอมที่แชร์ Hotspot หรือเราเตอร์)
IPAddress SUBNET        (255, 255, 255, 0);   // <-- Subnet Mask (ปกติ 255.255.255.0)
IPAddress PRIMARY_DNS   (8, 8, 8, 8);         // <-- DNS หลัก (Google DNS)
IPAddress SECONDARY_DNS (1, 1, 1, 1);         // <-- DNS สำรอง (Cloudflare DNS)

// =====================================================
// CAMERA PIN CONFIG - DFRobot ESP32-S3 AI Camera v1.1
// OV3660
// =====================================================

#define PWDN_GPIO_NUM     -1
#define RESET_GPIO_NUM    -1

#define XCLK_GPIO_NUM      5
#define SIOD_GPIO_NUM      8
#define SIOC_GPIO_NUM      9

#define Y9_GPIO_NUM        4
#define Y8_GPIO_NUM        6
#define Y7_GPIO_NUM        7
#define Y6_GPIO_NUM        14
#define Y5_GPIO_NUM        17
#define Y4_GPIO_NUM        21
#define Y3_GPIO_NUM        18
#define Y2_GPIO_NUM        16

#define VSYNC_GPIO_NUM     1
#define HREF_GPIO_NUM      2
#define PCLK_GPIO_NUM      15


// =====================================================
// HTTP SERVER
// =====================================================

static httpd_handle_t streamServer = NULL;

static const char *STREAM_CONTENT_TYPE =
    "multipart/x-mixed-replace;boundary=frame";

static const char *STREAM_BOUNDARY =
    "\r\n--frame\r\n";

static const char *STREAM_PART_HEADER =
    "Content-Type: image/jpeg\r\n"
    "Content-Length: %u\r\n\r\n";

// Forward declaration
static esp_err_t stream_handler(httpd_req_t *req);


// =====================================================
// MAIN WEB PAGE & AUTO-STREAM
// =====================================================

static esp_err_t index_handler(httpd_req_t *req)
{
    // ตรวจสอบว่า Client ขอแบบรูปภาพ (เช่น แท็ก <img src="http://192.168.137.112/"> จากหน้าเว็บ) หรือไม่
    // หากขอเป็นภาพ ให้ส่ง MJPEG Stream ออกไปทันที!
    char accept_hdr[128] = {0};
    if (httpd_req_get_hdr_value_str(req, "Accept", accept_hdr, sizeof(accept_hdr)) == ESP_OK)
    {
        if (strstr(accept_hdr, "image/") != NULL || strstr(accept_hdr, "multipart/") != NULL)
        {
            return stream_handler(req);
        }
    }

    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_type(req, "text/html");

    const char *html =
        "<!DOCTYPE html>"
        "<html>"
        "<head>"
        "<meta charset='UTF-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'>"
        "<title>ESP32-S3 AI Camera — Live Feed</title>"
        "<style>"
        "body{margin:0;padding:0;background:#0d1117;color:#f0f6fc;font-family:system-ui,sans-serif;text-align:center;}"
        "header{padding:14px;background:#161b22;border-bottom:1px solid #30363d;font-size:15px;font-weight:600;letter-spacing:0.05em;color:#f5c9a8;}"
        ".container{padding:20px;max-width:900px;margin:auto;}"
        "img{display:block;width:100%;max-width:800px;margin:15px auto;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.6);border:1px solid #30363d;}"
        ".meta{font-size:13px;color:#8b949e;margin-top:10px;}"
        "a{color:#f5c9a8;text-decoration:none;font-weight:600;}"
        "a:hover{text-decoration:underline;}"
        "</style>"
        "</head>"
        "<body>"
        "<header>VIGIL SECURITY — ESP32-S3 CAMERA LIVE STREAM</header>"
        "<div class='container'>"
        "<img src='/stream' alt='Live MJPEG Stream'>"
        "<div class='meta'>"
        "Direct Stream: <a href='/stream'>/stream</a> &nbsp;|&nbsp; "
        "Snapshot: <a href='/capture'>/capture</a>"
        "</div>"
        "</div>"
        "</body>"
        "</html>";

    return httpd_resp_send(req, html, strlen(html));
}


// =====================================================
// MJPEG STREAM HANDLER (พร้อม CORS สำหรับหน้าเว็บ)
// =====================================================

static esp_err_t stream_handler(httpd_req_t *req)
{
    camera_fb_t *fb = NULL;

    // ตั้งค่า CORS Header เพื่อให้หน้าเว็บ detection.html ดึงภาพได้สมบูรณ์
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Methods", "GET, OPTIONS");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Headers", "*");
    httpd_resp_set_hdr(req, "Cache-Control", "no-cache, no-store, must-revalidate");
    httpd_resp_set_hdr(req, "Pragma", "no-cache");
    httpd_resp_set_hdr(req, "Expires", "0");

    esp_err_t res = httpd_resp_set_type(req, STREAM_CONTENT_TYPE);
    if (res != ESP_OK)
        return res;

    char part_buf[64];

    while (true)
    {
        // Capture image
        fb = esp_camera_fb_get();

        if (!fb)
        {
            Serial.println("Camera capture failed");
            res = ESP_FAIL;
        }
        else
        {
            // Prepare JPEG header
            size_t hlen = snprintf(
                part_buf,
                sizeof(part_buf),
                STREAM_PART_HEADER,
                fb->len
            );

            // Send boundary
            res = httpd_resp_send_chunk(req, STREAM_BOUNDARY, strlen(STREAM_BOUNDARY));

            // Send JPEG header
            if (res == ESP_OK)
            {
                res = httpd_resp_send_chunk(req, part_buf, hlen);
            }

            // Send image buffer
            if (res == ESP_OK)
            {
                res = httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len);
            }

            // Return framebuffer
            esp_camera_fb_return(fb);
        }

        // Client disconnected
        if (res != ESP_OK)
        {
            break;
        }

        // Delay ป้องกัน WiFi / CPU โอเวอร์โหลด
        delay(1);
    }

    return res;
}


// =====================================================
// SINGLE FRAME SNAPSHOT HANDLER (/capture)
// =====================================================

static esp_err_t capture_handler(httpd_req_t *req)
{
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb)
    {
        Serial.println("Camera snapshot capture failed");
        httpd_resp_send_500(req);
        return ESP_FAIL;
    }

    httpd_resp_set_type(req, "image/jpeg");
    httpd_resp_set_hdr(req, "Content-Disposition", "inline; filename=capture.jpg");
    httpd_resp_set_hdr(req, "Access-Control-Allow-Origin", "*");
    httpd_resp_set_hdr(req, "Cache-Control", "no-cache, no-store, must-revalidate");

    esp_err_t res = httpd_resp_send(req, (const char *)fb->buf, fb->len);
    esp_camera_fb_return(fb);
    return res;
}


// =====================================================
// START CAMERA WEB SERVER
// =====================================================

void startCameraServer()
{
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.server_port = 80;
    config.stack_size = 8192;
    config.max_uri_handlers = 8;

    httpd_uri_t index_uri = {};
    index_uri.uri = "/";
    index_uri.method = HTTP_GET;
    index_uri.handler = index_handler;

    httpd_uri_t stream_uri = {};
    stream_uri.uri = "/stream";
    stream_uri.method = HTTP_GET;
    stream_uri.handler = stream_handler;

    httpd_uri_t capture_uri = {};
    capture_uri.uri = "/capture";
    capture_uri.method = HTTP_GET;
    capture_uri.handler = capture_handler;

    if (httpd_start(&streamServer, &config) == ESP_OK)
    {
        httpd_register_uri_handler(streamServer, &index_uri);
        httpd_register_uri_handler(streamServer, &stream_uri);
        httpd_register_uri_handler(streamServer, &capture_uri);

        Serial.println("HTTP Server Started on port 80");
    }
    else
    {
        Serial.println("HTTP Server FAILED to start");
    }
}


// =====================================================
// CAMERA INITIALIZATION
// =====================================================

bool openCamera()
{
    camera_config_t config;

    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer   = LEDC_TIMER_0;

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
    config.pixel_format = PIXFORMAT_JPEG;

    if (psramFound())
    {
        config.frame_size   = FRAMESIZE_SVGA;   // 800x600 สตรีมลื่นไหล คมชัดสูง
        config.jpeg_quality = 10;               // คุณภาพภาพสูง
        config.fb_count     = 2;
        config.fb_location  = CAMERA_FB_IN_PSRAM;
        config.grab_mode    = CAMERA_GRAB_LATEST;
    }
    else
    {
        config.frame_size   = FRAMESIZE_VGA;    // 640x480
        config.jpeg_quality = 12;
        config.fb_count     = 1;
        config.fb_location  = CAMERA_FB_IN_DRAM;
        config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;
    }

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK)
    {
        Serial.printf("CAMERA_INIT_FAILED: 0x%x\n", err);
        return false;
    }

    Serial.println("Camera initialized successfully");

    // SENSOR SETTINGS FOR OV3660
    sensor_t *s = esp_camera_sensor_get();
    if (s != nullptr && s->id.PID == OV3660_PID)
    {
        s->set_vflip(s, 1);
        s->set_brightness(s, 1);
        s->set_contrast(s, 1);
        s->set_saturation(s, 0);
        s->set_sharpness(s, 2);
        s->set_special_effect(s, 0);
        s->set_whitebal(s, 1);
        s->set_awb_gain(s, 1);
        s->set_exposure_ctrl(s, 1);
        s->set_gain_ctrl(s, 1);
        s->set_aec2(s, 1);
        s->set_lenc(s, 1);

        Serial.println("OV3660 image tuning applied");
    }

    return true;
}


// =====================================================
// SERIAL INPUT HELPER
// =====================================================

String readSerialLine(uint32_t timeoutMs = 15000)
{
    String line = "";
    uint32_t start = millis();

    while (millis() - start < timeoutMs)
    {
        if (Serial.available())
        {
            char c = Serial.read();
            if (c == '\n' || c == '\r')
            {
                if (line.length() > 0)
                {
                    return line;
                }
            }
            else
            {
                line += c;
            }
        }
        delay(5);
    }

    return line;
}


// =====================================================
// WIFI & CAMERA STATUS HELPER
// =====================================================

static bool isApModeActive = false;

void printCamUrlSummary()
{
    bool isConnected = (WiFi.status() == WL_CONNECTED);
    String ipStr = isConnected ? WiFi.localIP().toString() : (isApModeActive ? WiFi.softAPIP().toString() : "0.0.0.0");

    Serial.println();
    Serial.println("===============================================================");
    if (isConnected)
    {
        Serial.println("  [OK] WIFI CONNECTED SUCCESSFULLY! (เชื่อมต่อ WiFi สำเร็จ)");
        Serial.println("===============================================================");
        Serial.printf ("  SSID            : %s\n", WiFi.SSID().c_str());
        Serial.printf ("  Signal (RSSI)   : %d dBm\n", WiFi.RSSI());
        Serial.printf ("  IP Address      : %s (%s)\n", ipStr.c_str(), USE_STATIC_IP ? "STATIC IP" : "DHCP");
        Serial.printf ("  Gateway         : %s\n", WiFi.gatewayIP().toString().c_str());
        Serial.printf ("  MAC Address     : %s\n", WiFi.macAddress().c_str());
    }
    else if (isApModeActive)
    {
        Serial.println("  [AP] ACCESS POINT MODE (โหมดกระจาย Wi-Fi เอง)");
        Serial.println("===============================================================");
        Serial.println("  SSID            : ESP32-VIGIL-CAM");
        Serial.println("  Password        : 12345678");
        Serial.printf ("  AP IP Address   : %s\n", ipStr.c_str());
    }
    else
    {
        Serial.println("  [FAIL] WIFI NOT CONNECTED! (ยังไม่ได้เชื่อมต่อ WiFi)");
        Serial.println("===============================================================");
    }

    Serial.println("---------------------------------------------------------------");
    Serial.println("  >>> CAMERA URLs (ลิงก์ดูกล้อง) <<<");
    Serial.printf ("  1. Live Stream URL : http://%s/stream\n", ipStr.c_str());
    Serial.printf ("  2. Web Browser     : http://%s/\n", ipStr.c_str());
    Serial.printf ("  3. Snapshot Image  : http://%s/capture\n", ipStr.c_str());
    Serial.println("---------------------------------------------------------------");
    Serial.printf ("  >> นำ URL นี้ไปใส่ในหน้าเว็บ: http://%s/stream\n", ipStr.c_str());
    Serial.println("  >> กด ENTER หรือส่ง '?' ใน Serial Monitor เพื่อแสดงข้อความนี้ซ้ำ");
    Serial.println("===============================================================\n");
}


// =====================================================
// SETUP
// =====================================================

void setup()
{
    // กำหนด Baud Rate 115200 สำหรับ Serial Monitor (มาตรฐาน Arduino IDE)
    Serial.begin(115200);
    delay(1500);

    Serial.println();
    Serial.println("===============================================================");
    Serial.println("        VIGIL SECURITY — ESP32-S3 AI CAMERA");
    Serial.println("          High Quality MJPEG Streaming System");
    Serial.println("===============================================================");
    Serial.println("[INFO] Baud Rate: 115200");

    // 1. Initialize Camera
    Serial.println("[INFO] Initializing Camera Sensor (OV3660)...");
    if (!openCamera())
    {
        Serial.println("[ERROR] CAMERA_INIT_FAILED - กรุณาตรวจสอบการต่อสายกล้อง!");
        return;
    }
    Serial.println("[OK] Camera initialized successfully!");

    // 2. WiFi Setup
    String ssid = String(WIFI_SSID);
    String password = String(WIFI_PASSWORD);

    // หากไม่มีการระบุ WiFi_SSID ในโค้ด ให้ถามผ่าน Serial หรือรอ 10 วินาที
    if (ssid.length() == 0)
    {
        Serial.println();
        Serial.println("Enter WiFi SSID (or wait 10s to use saved WiFi):");
        ssid = readSerialLine(10000);

        if (ssid.length() > 0)
        {
            Serial.println("Enter WiFi Password:");
            password = readSerialLine(10000);
        }
    }

    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false); // ปิด sleep เพื่อให้สตรีมภาพลื่นไหล ป้องกันภาพกระตุก

    // กำหนด Static IP (หากเปิดใช้งาน USE_STATIC_IP)
    if (USE_STATIC_IP)
    {
        if (!WiFi.config(STATIC_IP, GATEWAY, SUBNET, PRIMARY_DNS, SECONDARY_DNS))
        {
            Serial.println("[WARN] ตั้งค่า Static IP ไม่สำเร็จ! กำลังใช้ DHCP อัตโนมัติแทน...");
        }
        else
        {
            Serial.printf("[INFO] ล็อก IP คงที่ (Static IP): %s\n", STATIC_IP.toString().c_str());
        }
    }

    if (ssid.length() > 0)
    {
        Serial.printf("[WIFI] Connecting to '%s'", ssid.c_str());
        WiFi.begin(ssid.c_str(), password.c_str());
    }
    else
    {
        Serial.println("[WIFI] Connecting using saved WiFi credentials in NVS...");
        WiFi.begin();
    }

    int retryCount = 0;
    while (WiFi.status() != WL_CONNECTED && retryCount < 40)
    {
        delay(400);
        Serial.print(".");
        retryCount++;
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED)
    {
        isApModeActive = false;
        Serial.println("[OK] Connected to WiFi router/hotspot!");
    }
    else
    {
        Serial.println("[WARN] Could not connect to WiFi! Starting fallback Access Point...");
        WiFi.mode(WIFI_AP);
        WiFi.softAP("ESP32-VIGIL-CAM", "12345678");
        isApModeActive = true;
        Serial.println("[OK] AP Mode Active: SSID 'ESP32-VIGIL-CAM'");
    }

    // 3. Start Camera Web Server
    startCameraServer();

    // 4. Output Summary Information
    printCamUrlSummary();
}


// =====================================================
// MAIN LOOP
// =====================================================

void loop()
{
    static unsigned long lastStatusPrint = 0;
    static bool previousConnectionStatus = (WiFi.status() == WL_CONNECTED);
    unsigned long currentMillis = millis();

    // 1. ตรวจสอบหากผู้ใช้พิมพ์หรือกด Enter ใน Serial Monitor ให้แสดง URL ทันที
    if (Serial.available())
    {
        while (Serial.available())
        {
            Serial.read(); // เคลียร์ buffer
        }
        printCamUrlSummary();
    }

    // 2. ปริ้นแจ้งสถานะ WiFi และ URL กล้องเป็นระยะทุกๆ 5 วินาที
    if (currentMillis - lastStatusPrint >= 5000)
    {
        lastStatusPrint = currentMillis;

        if (WiFi.status() == WL_CONNECTED)
        {
            // ถ้าเพิ่งต่อเน็ตสำเร็จหลังจากหลุดไป
            if (!previousConnectionStatus && !isApModeActive)
            {
                Serial.println("\n[WiFi] Network reconnected successfully!");
                printCamUrlSummary();
                previousConnectionStatus = true;
            }
            else
            {
                Serial.printf("[WiFi: Connected | IP: %s | RSSI: %ddBm] Cam URL: http://%s/stream\n",
                              WiFi.localIP().toString().c_str(),
                              WiFi.RSSI(),
                              WiFi.localIP().toString().c_str());
            }
        }
        else if (isApModeActive)
        {
            Serial.printf("[WiFi: AP Mode | IP: %s] Cam URL: http://%s/stream\n",
                          WiFi.softAPIP().toString().c_str(),
                          WiFi.softAPIP().toString().c_str());
        }
        else
        {
            previousConnectionStatus = false;
            Serial.println("[WiFi: Disconnected!] Reconnecting to WiFi...");
            WiFi.reconnect();
        }
    }

    delay(50);
}