# Vigil — Web IoT Face Recognition & Person Classification System

ระบบรักษาความปลอดภัยและจดจำใบหน้าอัจฉริยะ เชื่อมต่อระบบ IoT (ESP32-S3 AI Camera) และ AI Model (YOLOv8) พร้อมจำแนกบุคคล 3 กลุ่ม: **คนในบ้าน** • **คนส่งของ** • **คนแปลกหน้า**

---

## เอกสารระบบ (Full Documentation)
- 📘 **[YOLO_PERSON_DETECTION_SYSTEM.md](YOLO_PERSON_DETECTION_SYSTEM.md)**: คู่มือสถาปัตยกรรมระบบ YOLO, การจำแนก 3 กลุ่มบุคคล, ฐานข้อมูล SQLite พร้อมใช้งาน, และ API Docs
- 📑 **[project.md](project.md)**: รายละเอียดโปรเจคและโครงสร้างทางเทคนิคฉบับเต็ม

---

## โครงสร้างโปรเจค (Project Structure)
- **`backend/`**: FastAPI Server + YOLOv8 Inference + SQLite Database (`vigil.db`)
  - `app/services/yolo_service.py`: บริการตรวจจับบุคคลด้วย YOLOv8
  - `app/services/person_classifier.py`: เครื่องยนต์จำแนก 3 กลุ่มบุคคลและสร้างแจ้งเตือน
  - `app/models/`: โมเดลฐานข้อมูล `Person`, `DetectionHistory`, `Alert`, `User`
  - `app/api/v1/endpoints/`: เอนด์พอยต์ `detection`, `alerts`, `persons`, `auth`
- **`frontend/`**: React 19 + TailwindCSS Dashboard
  - `src/pages/detection/`: หน้ามอนิเตอร์สด กรอบตรวจจับ YOLO แยกสี 3 กลุ่ม และประวัติ
  - `src/pages/alerts/`: หน้ารายการแจ้งเตือนความปลอดภัย กรองตามกลุ่มบุคคล
  - `src/pages/training/`: ฐานข้อมูลบุคคลที่ลงทะเบียนและสถิติโมเดล
  - `src/pages/add-person/`: หน้าลงทะเบียนบุคคลใหม่แยกตาม 3 กลุ่ม
- **`esp32_camera_capture/`**: ซอร์สโค้ด Arduino สำหรับบอร์ด DFRobot ESP32-S3 (OV3660)
  - ให้บริการ `/stream` (MJPEG) และ `/capture` (Snapshot สำหรับ YOLO)

---

## วิธีเปิดใช้งานระบบ (How to Run)

### 1. เปิดเซิร์ฟเวอร์ Backend (FastAPI + YOLO + SQLite)
```bash
cd backend
python run.py
```
*(เปิดที่ http://localhost:8000 และดู API Docs ได้ที่ http://localhost:8000/docs)*

### 2. เปิดใช้งาน Frontend Dashboard (React)
```bash
cd frontend
cmd.exe /c "npm run dev"
```
*(เปิดหน้าเว็บที่ http://localhost:5173)*