# คู่มือระบบการลบการแจ้งเตือนและประวัติการตรวจจับ (Alerts & Detection History Deletion Guide)
**VIGIL — AI Smart Security & IoT Face Recognition System**

เอกสารนี้อธิบายสถาปัตยกรรม วิธีการทำงาน และการใช้งานระบบ **ลบการแจ้งเตือน (Security Alerts)** และ **ลบประวัติการตรวจจับ (Detection History)** ทั้งในฝั่ง Backend API (FastAPI + SQLite) และ Frontend Dashboard (React + Tailwind CSS)

---

## 1. ภาพรวมของฟีเจอร์ (Overview)

| ความสามารถ | รายละเอียด | หน้าจอที่ใช้งาน |
| :--- | :--- | :--- |
| **ลบการแจ้งเตือนทีละรายการ (Single Alert Delete)** | เลือกลบการแจ้งเตือนเหตุการณ์เฉพาะรายการ พร้อมหน้าต่างยืนยัน (Modal) | `/alerts` |
| **ล้างการแจ้งเตือนทั้งหมด / เฉพาะที่อ่านแล้ว (Clear Alerts)** | เลือกตัวเลือก: ลบทั้งหมด หรือ ลบเฉพาะรายการที่อ่านแล้ว เพื่อเก็บบันทึกเหตุการณ์สำคัญที่ยังไม่ได้ตรวจสอบ | `/alerts` |
| **ซิงก์ตัวเลขแจ้งเตือนแบบ Real-time** | เมื่อลบการแจ้งเตือน ตัวเลขสีแดง (Unread Badge) บน Navbar จะลดลงทันทีผ่าน Custom Event `vigil-alerts-updated` | ทุกหน้า |
| **ลบประวัติในหน้าตรวจจับสด (Live Detection History)** | ลบประวัติการตรวจจับล่าสุดทีละรายการ หรือล้างประวัติจากแถบด้านขวาของหน้า Live Camera | `/detection` |
| **หน้าจัดการประวัติฉบับเต็ม (Dedicated History Page)** | หน้าเพจใหม่สำหรับตรวจสอบ ค้นหา กรองหมวดหมู่ เลือกหลายรายการ (Bulk Select) และลบข้อมูลประวัติ | `/history` |
| **ความปลอดภัยของฐานข้อมูล (Database Integrity)** | มีการปลด Foreign Key (`Alert.detection_id = None`) อัตโนมัติก่อนลบ เพื่อป้องกันข้อผิดพลาดใน SQLite | Backend |

---

## 2. ข้อมูลจำเพาะ API ฝั่ง Backend (Backend API Specification)

### 2.1 ระบบแจ้งเตือน (Security Alerts Endpoints)

#### 1. ลบการแจ้งเตือนทีละรายการ
- **Method:** `DELETE`
- **Path:** `/api/v1/alerts/{alert_id}`
- **Parameters:**
  - `alert_id` (int, Path Parameter): รหัส ID ของแจ้งเตือนที่ต้องการลบ
- **Response:**
  - `204 No Content` (เมื่อลบสำเร็จ)
  - `404 Not Found` (หากไม่พบรหัสแจ้งเตือน)

#### 2. ล้างการแจ้งเตือนทั้งหมด หรือตามเงื่อนไข
- **Method:** `DELETE`
- **Path:** `/api/v1/alerts`
- **Query Parameters:**
  - `category` (string, optional): กรองลบเฉพาะหมวดหมู่ เช่น `household`, `delivery`, `stranger`
  - `read_only` (bool, optional): หากระบุเป็น `true` จะลบเฉพาะรายการที่มาร์กว่าอ่านแล้ว (`is_read == true`)
- **Response:**
  ```json
  {
    "message": "ลบการแจ้งเตือนสำเร็จ 5 รายการ",
    "deleted_count": 5
  }
  ```

---

### 2.2 ระบบประวัติการตรวจจับ (Detection History Endpoints)

#### 1. ลบประวัติการตรวจจับทีละรายการ
- **Method:** `DELETE`
- **Path:** `/api/v1/detection/history/{history_id}`
- **Parameters:**
  - `history_id` (int, Path Parameter): รหัส ID ของประวัติที่ต้องการลบ
- **กลไกความปลอดภัย (FK Safety):**
  - ก่อนลบเรคอร์ด ระบบจะค้นหาตาราง `alerts` ที่มี `detection_id == history_id` และอัปเดตเป็น `None` อัตโนมัติ เพื่อไม่ให้เกิด Foreign Key Violation ใน SQLite
- **Response:**
  - `204 No Content` (เมื่อลบสำเร็จ)
  - `404 Not Found` (หากไม่พบรหัสประวัติ)

#### 2. ล้างประวัติการตรวจจับทั้งหมด หรือตามหมวดหมู่
- **Method:** `DELETE`
- **Path:** `/api/v1/detection/history`
- **Query Parameters:**
  - `category` (string, optional): กรองลบเฉพาะหมวดหมู่ เช่น `household`, `delivery`, `stranger`
- **Response:**
  ```json
  {
    "message": "ลบประวัติการตรวจจับสำเร็จ 12 รายการ",
    "deleted_count": 12
  }
  ```

---

## 3. การใช้งานบนหน้าเว็บ Frontend (Frontend User Interface)

### 3.1 หน้าการแจ้งเตือน (`/alerts`)

1. **ปุ่มลบทีละรายการ:**
   - ในแต่ละการ์ดแจ้งเตือน จะมีไอคอนถังขยะ (`Trash2`) อยู่ทางขวามือ
   - เมื่อคลิก จะแสดง Modal ยืนยันการลบ พร้อมข้อมูลสรุปของเหตุการณ์นั้น
   - กดปุ่ม **"ยืนยันการลบ"** ข้อมูลจะถูกลบออกจากฐานข้อมูล และตัวเลข Badge ที่ Navbar จะลดลงทันที
2. **ปุ่มล้างการแจ้งเตือน (Clear Alerts):**
   - ที่แถบเครื่องมือด้านบน จะมีปุ่ม **"ล้างการแจ้งเตือน"** สีแดง
   - เมื่อคลิก จะมีตัวเลือก 2 แบบ:
     - **ลบเฉพาะรายการที่อ่านแล้ว:** เหมาะสำหรับเคลียร์กล่องข้อความโดยยังคงเก็บรายการใหม่ที่ยังไม่ได้ตรวจสอบไว้
     - **ลบทั้งหมดในหมวดหมู่นี้:** ล้างรายการทั้งหมดในหมวดหมู่ที่กำลังแสดงอยู่

---

### 3.2 หน้าประวัติการตรวจจับ (`/history`) — หน้าใหม่

สามารถเข้าถึงได้จากเมนู **"History"** บน Navbar ด้านบน:
1. **แถบสรุปสถิติ 4 ช่อง (Metric Cards):**
   - แสดงยอดบันทึกวันนี้, คนในบ้าน, คนส่งของ, และคนแปลกหน้า
2. **ตัวกรองและค้นหา (Filter & Search):**
   - ตัวกรองหมวดหมู่: ทั้งหมด, 🟢 คนในบ้าน, 📦 คนส่งของ, ⚠️ คนแปลกหน้า
   - ช่องค้นหา: พิมพ์ชื่อบุคคล, รหัสกล้อง, หรือตำแหน่งที่ตรวจพบ
3. **การเลือกหลายรายการเพื่อลบพร้อมกัน (Bulk Delete):**
   - ติ๊ก Checkbox หน้ารายการที่ต้องการลบ (หรือกด "เลือกทั้งหมด")
   - จะปรากฏปุ่มสีแดง **"ลบที่เลือก (N รายการ)"** ขึ้นที่แถบด้านบน
   - กดปุ่มเพื่อยืนยันการลบหลายรายการพร้อมกันในคลิกเดียว
4. **ปุ่มลบทีละรายการ:**
   - มีไอคอนถังขยะบนการ์ดแต่ละใบ
5. **ปุ่มดูภาพ Snapshot และข้อมูลเชิงลึก:**
   - คลิกที่รูปภาพหรือไอคอนดวงตา (`Eye`) เพื่อเปิด Modal ดูภาพขยายขนาดใหญ่, ค่าความแม่นยำ (Confidence), และเวลาที่บันทึก
6. **ปุ่มระบุตัวตน & เทรน (Identify & Train):**
   - สำหรับรายการคนแปลกหน้า สามารถกดปุ่ม **"ระบุตัวตน"** เพื่อนำภาพไปบันทึกชื่อและส่งเทรนเข้าสู่โมเดล AI ได้ทันที

---

### 3.3 หน้าตรวจจับสด (`/detection`)

- ในแถบด้านขวา **"Recent Detection History"**:
  - หัวการ์ดมีปุ่มไอคอนถังขยะ สำหรับกดล้างประวัติทั้งหมด
  - ทุกแถวของประวัติบุคคลมีปุ่มไอคอนถังขยะ สำหรับลบรายการนั้นๆ เฉพาะจุดได้ทันที
  - เมื่อลบแล้ว ตัวเลขสรุปบนหน้าจอและสถิติ MetricCards จะอัปเดตแบบเรียลไทม์

---

## 4. ตัวอย่างคำสั่งทดสอบผ่าน cURL (cURL Testing Commands)

### 4.1 ลบการแจ้งเตือน
```bash
# 1. ลบการแจ้งเตือน ID ที่ 1
curl -X DELETE "http://localhost:8000/api/v1/alerts/1"

# 2. ลบเฉพาะการแจ้งเตือนที่อ่านแล้ว
curl -X DELETE "http://localhost:8000/api/v1/alerts?read_only=true"

# 3. ลบการแจ้งเตือนหมวดหมู่ stranger ทั้งหมด
curl -X DELETE "http://localhost:8000/api/v1/alerts?category=stranger"

# 4. ลบการแจ้งเตือนทั้งหมดทุกหมวดหมู่
curl -X DELETE "http://localhost:8000/api/v1/alerts"
```

### 4.2 ลบประวัติการตรวจจับ
```bash
# 1. ลบประวัติ ID ที่ 1
curl -X DELETE "http://localhost:8000/api/v1/detection/history/1"

# 2. ลบประวัติเฉพาะหมวดหมู่ delivery
curl -X DELETE "http://localhost:8000/api/v1/detection/history?category=delivery"

# 3. ลบประวัติทั้งหมด
curl -X DELETE "http://localhost:8000/api/v1/detection/history"
```

---

## 5. ไฟล์ที่เกี่ยวข้องในระบบ (Related Files)

| โครงสร้างไฟล์ | หน้าที่และรายละเอียด |
| :--- | :--- |
| `backend/app/api/v1/endpoints/alerts.py` | API ลบแจ้งเตือนเดี่ยว และล้างแจ้งเตือนทั้งหมด (`DELETE /alerts`) |
| `backend/app/api/v1/endpoints/detection.py` | API ลบประวัติเดี่ยว และล้างประวัติทั้งหมด (`DELETE /detection/history`) พร้อม FK Safety |
| `frontend/src/services/api.js` | ฟังก์ชันเรียก API ฝั่ง Client (`clearAlerts`, `deleteAlert`, `clearHistory`, `deleteHistory`) |
| `frontend/src/pages/alerts/AlertsPage.jsx` | หน้า UI แจ้งเตือน พร้อมปุ่มลบทีละรายการและ Modal ล้างการแจ้งเตือน |
| `frontend/src/pages/detection/DetectionPage.jsx` | หน้าตรวจจับสด พร้อมปุ่มลบประวัติในแถบ Recent Detection History |
| `frontend/src/pages/history/HistoryPage.jsx` | หน้าเพจจัดการประวัติฉบับสมบูรณ์ (Filter, Search, Bulk Delete, Preview, Train) |
| `frontend/src/components/layout/Navbar.jsx` | เมนูนำทาง เพิ่มลิงก์เข้าสู่หน้า `/history` |
| `frontend/src/routes/routes.tsx` | กำหนด Route `/history` ใน ProtectedRoute |
