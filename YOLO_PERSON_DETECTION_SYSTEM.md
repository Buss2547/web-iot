# Vigil AI — ระบบตรวจจับและจำแนกบุคคลด้วย YOLO (3 กลุ่มบุคคล)

> **เอกสารคู่มือสถาปัตยกรรมและการใช้งานระบบตรวจจับและจำแนกบุคคลอัจฉริยะ**  
> เชื่อมต่อระหว่าง **ESP32-CAM (OV3660)** → **โมเดล YOLOv8** → **ระบบจำแนกบุคคล 3 กลุ่ม** → **ระบบแจ้งเตือน (Alerts)** → **บันทึกประวัติ (History)** ลงฐานข้อมูล **SQLite พร้อมใช้งาน** → **แดชบอร์ด React Frontend**

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (System Architecture)

```
+---------------------------+
|    ESP32-S3 AI Camera     |
|   (OV3660 / Wi-Fi Node)   |
+-------------+-------------+
              |  1. GET /capture (Single JPEG Snapshot)
              |     GET /stream  (MJPEG Stream)
              v
+-----------------------------------------------------------+
|                   FastAPI Backend Server                  |
|                                                           |
|  [ YOLOv8 Inference Engine ]                             |
|    - ตรวจจับตัวบุคคลในภาพ (Bounding Box [x1, y1, x2, y2]) |
|                                                           |
|  [ Person Classification Engine ]                         |
|    - วิเคราะห์และจำแนกออกเป็น 3 กลุ่ม:                    |
|      1. คนในบ้าน (Household)                              |
|      2. คนส่งของ (Delivery)                               |
|      3. คนแปลกหน้า (Stranger)                             |
|                                                           |
|  [ Event & Alert Trigger Engine ]                         |
|    - ตรวจสอบเงื่อนไขความปลอดภัยและสร้าง Alert อัตโนมัติ   |
|                                                           |
|  [ Database Service (SQLite) ]                            |
|    - บันทึกประวัติการตรวจจับ (Detection History)          |
|    - บันทึกรายการแจ้งเตือน (Security Alerts)              |
|    - ฐานข้อมูลบุคคลที่ลงทะเบียน (Person Registry)         |
+-----------------------------+-----------------------------+
                              |
                              | 2. REST API / Real-time Sync
                              v
+-----------------------------------------------------------+
|                     Frontend Web App                      |
|                  (React 19 + TailwindCSS)                 |
|                                                           |
|  - Live Detection & Monitoring (กรอบตรวจจับแยกสี 3 กลุ่ม) |
|  - Security Alerts Page (กรองและจัดการสถานะแจ้งเตือน)     |
|  - AI Model & Person Database (ลงทะเบียนบุคคลใหม่ 3 กลุ่ม)|
+-----------------------------------------------------------+
```

---

## 2. รายละเอียดการจำแนกบุคคล 3 กลุ่ม (The 3 Classification Categories)

ระบบแบ่งประเภทบุคคลที่ตรวจพบอย่างชัดเจน เพื่อตอบสนองต่อสถานการณ์ความปลอดภัยที่แตกต่างกัน:

| กลุ่มบุคคล | ป้ายกำกับ (Category) | สีประจำกลุ่ม (UI) | เกณฑ์การจำแนก | พฤติกรรมระบบและการแจ้งเตือน |
| :--- | :--- | :--- | :--- | :--- |
| **คนในบ้าน** | `household` | 🟢 เขียว (`#2e7d32`) | จับคู่กับสมาชิกครอบครัวที่ลงทะเบียนในระบบสำเร็จ (ความมั่นใจ > 92%) | • ระบุชื่อสมาชิก เช่น "ดร. สมชาย รักสงบ"<br>• สถานะ: ปลอดภัย (`VERIFIED OK`)<br>• แจ้งเตือนระดับ `info` (ยินดีต้อนรับกลับบ้าน) |
| **คนส่งของ** | `delivery` | 🟡 ส้ม/อำพัน (`#e65100`) | ตรวจพบเครื่องแบบ/สีเอกลักษณ์ (Flash สีเหลือง, Kerry สีส้ม, Grab สีเขียว) หรือลงทะเบียนเป็นไรเดอร์ | • ระบุชื่อขนส่ง เช่น "พนักงาน Flash Express"<br>• สถานะ: พัสดุมาส่ง (`DELIVERY EVENT`)<br>• แจ้งเตือนระดับ `info/notice` แจ้งเตือนรับพัสดุ |
| **คนแปลกหน้า** | `stranger` | 🔴 แดง (`#c62828`) | ไม่พบข้อมูลในฐานข้อมูล และไม่มีคุณลักษณะของคนส่งของ | • ระบุเป็น "บุคคลแปลกหน้า (Stranger #1)"<br>• สถานะ: เฝ้าระวัง (`ALERT RECORDED`)<br>• **สร้าง Security Alert ระดับ `warning` ทันที** |

---

## 3. โครงสร้างฐานข้อมูล SQLite พร้อมใช้งาน (Database Schema)

ไฟล์ฐานข้อมูล SQLite ตั้งอยู่ที่: `backend/data/vigil.db`  
ระบบมีฟังก์ชัน **Auto-seeding** ที่จะสร้างตารางและเติมข้อมูลตัวอย่างให้ทันทีเมื่อรัน Backend ครั้งแรก (**พร้อมใช้งานทันที ไม่ต้องรัน Migration ด้วยตนเอง**)

### 3.1 ตาราง `persons` (รายชื่อบุคคลในระบบ)
| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `id` | INTEGER PRIMARY KEY | รหัสบุคคล (Auto-increment) |
| `name` | VARCHAR | ชื่อ-นามสกุล |
| `category` | VARCHAR (Indexed) | `household`, `delivery`, หรือ `stranger` |
| `role` | VARCHAR | Family, Delivery, Stranger, VIP |
| `department` | VARCHAR | แผนกหรือบริษัทขนส่ง เช่น "Flash Express", "Residence" |
| `notes` | TEXT | รายละเอียดความปลอดภัยและสิทธิ์การเข้าออก |
| `photo_url` | VARCHAR | ลิงก์รูปภาพโปรไฟล์อ้างอิง |
| `accuracy` | FLOAT | ความแม่นยำของข้อมูลใบหน้า (%) |
| `images_count`| INTEGER | จำนวนภาพใน Dataset |
| `is_active` | BOOLEAN | สถานะเปิดใช้งาน |
| `created_at` | DATETIME | วันเวลาที่ลงทะเบียน |
| `updated_at` | DATETIME | วันเวลาที่แก้ไขล่าสุด |

### 3.2 ตาราง `detection_history` (ประวัติการตรวจจับ)
| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `id` | INTEGER PRIMARY KEY | รหัสประวัติ (Auto-increment) |
| `person_id` | INTEGER (Foreign Key) | อ้างอิงบุคคลในตาราง persons (nullable) |
| `person_name` | VARCHAR | ชื่อบุคคลที่ตรวจพบ |
| `category` | VARCHAR (Indexed) | `household`, `delivery`, หรือ `stranger` |
| `confidence` | FLOAT | ค่าความเชื่อมั่นของโมเดล (%) |
| `bounding_box` | TEXT | พิกัดกรอบ JSON `[x1, y1, x2, y2]` |
| `snapshot_path`| VARCHAR | ที่อยู่ไฟล์ภาพ Snapshot ที่บันทึกไว้ |
| `camera_id` | VARCHAR | รหัสกล้องที่จับได้ เช่น `cam-1`, `ESP32-CAM` |
| `location` | VARCHAR | ตำแหน่งเกิดเหตุ เช่น "หน้าประตูหลัก (Main Entrance)" |
| `alert_triggered`| BOOLEAN | มีการสร้างแจ้งเตือนจากเหตุการณ์นี้หรือไม่ |
| `timestamp` | DATETIME (Indexed) | เวลาที่ตรวจพบ |

### 3.3 ตาราง `alerts` (รายการแจ้งเตือนความปลอดภัย)
| คอลัมน์ | ชนิดข้อมูล | คำอธิบาย |
| :--- | :--- | :--- |
| `id` | INTEGER PRIMARY KEY | รหัสแจ้งเตือน (Auto-increment) |
| `title` | VARCHAR | หัวข้อการแจ้งเตือน |
| `description` | TEXT | รายละเอียดของเหตุการณ์ |
| `category` | VARCHAR (Indexed) | `household`, `delivery`, หรือ `stranger` |
| `severity` | VARCHAR | ระดับความรุนแรง (`info`, `warning`, `critical`) |
| `location` | VARCHAR | ตำแหน่งที่เกิดเหตุ |
| `detection_id`| INTEGER (Foreign Key) | เชื่อมโยงกับตาราง detection_history |
| `thumbnail` | VARCHAR | ภาพ Snapshot ตัวอย่างเหตุการณ์ |
| `is_read` | BOOLEAN (Indexed) | สถานะอ่านแล้ว (`true`/`false`) |
| `created_at` | DATETIME (Indexed) | เวลาที่สร้างการแจ้งเตือน |

---

## 4. รายละเอียด API Endpoints ทั้งหมด (RESTful API)

API Base URL: `http://localhost:8000/api/v1`  
สามารถเปิดดู Swagger UI ทดสอบได้ที่: `http://localhost:8000/docs`

### 4.1 ตรวจจับและประวัติ (Detection & History)
- `POST /api/v1/detection/detect-esp32`:
  - **คำอธิบาย**: สั่ง Backend เชื่อมต่อไปยัง ESP32-CAM เพื่อดึง Snapshot ปัจจุบัน แล้วรันโมเดล YOLOv8 + จำแนกบุคคล และบันทึกประวัติ/แจ้งเตือนลงฐานข้อมูลทันที
  - **Request Body**:
    ```json
    {
      "camera_ip": "192.168.137.112",
      "camera_port": "",
      "camera_path": "/capture",
      "location": "หน้าบ้าน (Main Entrance)"
    }
    ```
  - **Response Body**:
    ```json
    {
      "success": true,
      "camera_id": "ESP32 (192.168.137.112)",
      "timestamp": "2026-09-06T12:53:28.568Z",
      "detections_count": 1,
      "detections": [
        {
          "person_name": "พนักงาน Flash Express",
          "category": "delivery",
          "confidence": 96.5,
          "bounding_box": [160, 60, 480, 520],
          "alert_created": true,
          "alert_message": "มีพัสดุมาส่ง: พนักงาน Flash Express บริเวณหน้าบ้าน",
          "role": "Delivery",
          "location": "หน้าบ้าน (Main Entrance)"
        }
      ]
    }
    ```

- `POST /api/v1/detection/detect-image`:
  - **คำอธิบาย**: อัปโหลดไฟล์ภาพ (Multipart Form) เพื่อให้ YOLO วิเคราะห์และบันทึกประวัติ
  - **Form Fields**: `file` (Binary Image), `camera_id`, `location`, `force_category` (อุปกรณ์เสริม)

- `GET /api/v1/detection/history`:
  - **คำอธิบาย**: ดึงรายการประวัติการตรวจจับ เรียงจากเหตุการณ์ล่าสุด
  - **Query Parameters**: `category` (`household`, `delivery`, `stranger`, หรือ `ALL`), `limit`, `offset`

- `GET /api/v1/detection/stats`:
  - **คำอธิบาย**: สรุปยอดตรวจจับประจำวันแยกตาม 3 กลุ่ม:
    ```json
    {
      "total_today": 7,
      "household_count": 3,
      "delivery_count": 2,
      "stranger_count": 2,
      "alerts_count": 6
    }
    ```

### 4.2 ระบบแจ้งเตือน (Security Alerts)
- `GET /api/v1/alerts`: เรียกดูรายการแจ้งเตือนทั้งหมด (รองรับ `category` และ `unread_only=true`)
- `PUT /api/v1/alerts/{id}/read`: เปลี่ยนสถานะเป็นอ่านแล้ว
- `PUT /api/v1/alerts/read-all`: ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
- `DELETE /api/v1/alerts/{id}`: ลบการแจ้งเตือน

### 4.3 จัดการรายชื่อบุคคล (Person Database)
- `GET /api/v1/persons`: ดึงรายชื่อบุคคลทั้งหมด (รองรับตัวกรองหมวดหมู่และการค้นหา)
- `POST /api/v1/persons`: ลงทะเบียนบุคคลใหม่ พร้อมระบุ `category` (`household`, `delivery`, `stranger`)
- `PUT /api/v1/persons/{id}`: แก้ไขข้อมูลบุคคล
- `DELETE /api/v1/persons/{id}`: ลบบุคคลออกจากระบบ

---

## 5. การตั้งค่าและแฟลชกล้อง ESP32-CAM

ไฟล์ซอร์สโค้ด: `esp32_camera_capture/esp32_camera_capture.ino`

### คุณสมบัติของโค้ดกล้องที่อัปเดต:
1. **`/stream`**: สตรีมวิดีโอสดแบบ MJPEG (สำหรับมอนิเตอร์บนหน้าเว็บ)
2. **`/capture`**: ส่งภาพ Snapshot นิ่ง JPEG 1 เฟรมความเร็วสูง พร้อม Header `Access-Control-Allow-Origin: *` เพื่อให้ Backend AI ดึงไปรัน YOLO ได้โดยไม่ทำให้สตรีมกระตุก
3. **`/status`**: คืนค่า Telemetry JSON (IP, สัญญาณ Wi-Fi RSSI, Free Heap, สถานะ PSRAM)

### ขั้นตอนการเบิร์นโปรแกรมลงบอร์ด DFRobot ESP32-S3:
1. เปิด Arduino IDE
2. ไปที่ **Tools** → เลือกบอร์ด: **ESP32S3 Dev Module**
3. ตั้งค่าการ Compile:
   - **PSRAM**: `OPI PSRAM`
   - **Flash Mode**: `QIO 80MHz`
   - **Upload Speed**: `921600`
   - **USB CDC On Boot**: `Enabled`
4. ปรับแก้ชื่อ Wi-Fi และรหัสผ่านในโค้ด:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
5. กดปุ่ม **Upload**
6. เปิด Serial Monitor ที่ความเร็ว **115200 bps** เพื่อดู IP Address เช่น `http://192.168.137.112`

---

## 6. วิธีการเปิดใช้งานระบบ (How to Run System)

### 6.1 เปิดใช้งาน Backend (FastAPI + YOLO + SQLite)
```bash
# 1. เข้าโฟลเดอร์ backend
cd backend

# 2. รันเซิร์ฟเวอร์
python run.py
```
- เซิร์ฟเวอร์จะเปิดที่: `http://localhost:8000`
- เอกสาร API Docs: `http://localhost:8000/docs`
- ฐานข้อมูลจะถูกสร้างและ Seed ข้อมูลให้อัตโนมัติที่ `backend/data/vigil.db`

### 6.2 เปิดใช้งาน Frontend (React + Vite Dashboard)
```bash
# 1. เข้าโฟลเดอร์ frontend
cd frontend

# 2. เปิดใช้งาน Dev Server
cmd.exe /c "npm run dev"
```
- หน้าเว็บจะเปิดที่: `http://localhost:5173` (หรือพอร์ตที่ Vite กำหนด)

---

## 7. คู่มือการทดสอบระบบ (Verification & Testing)

1. **ทดสอบหน้ามอนิเตอร์สด (Live Detection)**:
   - เข้าหน้าเว็บไปที่ `/detection`
   - การ์ดสถิติ 4 ด้านบนจะแสดงจำนวน: **คนในบ้าน**, **คนส่งของ**, **คนแปลกหน้า**, **ตรวจจับทั้งหมด** ดึงจากฐานข้อมูลจริง
   - ตาราง **Recent Detection History** ด้านขวาจะแสดงประวัติพร้อมรูปถ่ายและประเภทบุคคล สามารถคลิกแท็บกรองตามกลุ่มได้
   - กดปุ่ม **"ตรวจจับด้วย YOLO AI"** ระบบจะส่งคำขอไปยัง Backend รันโมเดล YOLO และจำแนกประเภทคนขึ้นกรอบ Bounding Box แยกสีชัดเจน
   - หากตรวจพบคนแปลกหน้า จะมีแถบเตือนสีส้มแดงเตือนภัยด้านบนทันที

2. **ทดสอบหน้าการแจ้งเตือน (Security Alerts)**:
   - เข้าไปที่ `/alerts`
   - จะเห็นรายการแจ้งเตือนที่จัดกลุ่มไว้ คลิกปุ่มหมวดหมู่เพื่อกรองดูเฉพาะ **คนแปลกหน้า** หรือ **คนส่งของ**
   - คลิกที่กล่องแจ้งเตือนเพื่อสลับสถานะเป็น "รับทราบแล้ว (Read)" หรือคลิกปุ่ม **"อ่านทั้งหมด"** ข้อมูลจะถูกบันทึกลงฐานข้อมูล SQLite ทันที

3. **ทดสอบหน้าลงทะเบียนบุคคล (Add Person)**:
   - เข้าไปที่ `/training` แล้วกดปุ่ม **"ลงทะเบียนบุคคลใหม่"** (หรือเปิด `/add-person`)
   - จะมีการ์ดเลือก 3 กลุ่มบุคคล: **คนในบ้าน**, **คนส่งของ**, **คนแปลกหน้า**
   - กรอกชื่อและอัปโหลดรูปภาพ แล้วกด **"บันทึกบุคคลใหม่"**
   - ข้อมูลจะถูกเพิ่มเข้าสู่ฐานข้อมูล SQLite และปรากฏในตารางบุคคลทันที
