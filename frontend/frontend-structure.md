# Vigil Frontend — Architecture & Component Structure Documentation
ระบบตรวจจับและจดจำใบหน้าอัจฉริยะ (AI Smart Security & IoT Face Recognition System)
**เทคโนโลยีหลัก:** React 19 + React Router v8 + Tailwind CSS v4 + Vite

---

## 1. ภาพรวมเทคโนโลยี (Tech Stack)

| ส่วนประกอบ | เทคโนโลยีที่ใช้ | เวอร์ชัน / รายละเอียด |
| :--- | :--- | :--- |
| **UI Framework** | React | `^19.2.8` |
| **Build Tool** | Vite | `^8.2.2` + React Compiler |
| **Routing** | React Router | `^8.3.1` (Data Router / `createBrowserRouter`) |
| **CSS Framework** | Tailwind CSS | `^4.3.3` (ใช้ `@tailwindcss/vite` และ `@theme` ใน CSS) |
| **Icons (แนะนำ)** | Lucide React | ไอคอนสไตล์ Modern Minimal สำหรับ Dashboard IoT |

---

## 2. โครงสร้างโฟลเดอร์ระบบ (`frontend/src/`)

```text
frontend/
├── public/                     # Static assets (เช่น ไฟล์เสียงแจ้งเตือน, Favicon)
├── src/
│   ├── assets/                 # รูปภาพ โลโก้ และภาพประกอบจำลอง
│   │   ├── logo.svg
│   │   └── mock-camera.jpg
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── common/             # UI Components พื้นฐานที่ใช้ได้ทุกหน้า
│   │   │   ├── Button.jsx      # ปุ่มกดพร้อม Variant (primary, secondary, danger)
│   │   │   ├── Badge.jsx       # แท็กสถานะ (Known, Unknown, Blacklist, VIP, etc.)
│   │   │   ├── Input.jsx       # ช่องกรอกข้อมูลพร้อม Label & Error State
│   │   │   ├── MetricCard.jsx  # การ์ดแสดงตัวเลขสถิติ 4 ช่องในหน้า Detection
│   │   │   └── Modal.jsx       # ป๊อปอัปแจ้งเตือน / ยืนยัน
│   │   │
│   │   └── layout/             # โครงสร้าง Layout รวม
│   │       ├── MainLayout.jsx  # Layout หลัก (มี Navbar ด้านบน + เนื้อหา + Footer)
│   │       ├── AuthLayout.jsx  # Layout หน้า Login / Signup (Card กลางจอ)
│   │       ├── Navbar.jsx      # Capsule Navigation Menu (`.nav-pills`)
│   │       └── Footer.jsx      # ท้ายหน้าแสดงเวอร์ชันและลิขสิทธิ์
│   │
│   ├── pages/                  # หน้าเพจหลักทั้ง 7 หน้า (ตาม project.md)
│   │   ├── landing/            # [1] หน้าแรก Landing Page
│   │   │   ├── LandingPage.jsx
│   │   │   └── components/
│   │   │       ├── HeroSection.jsx
│   │   │       └── FeatureCards.jsx
│   │   │
│   │   ├── detection/          # [2] หน้าตรวจจับใบหน้า & มอนิเตอร์กล้องสด
│   │   │   ├── DetectionPage.jsx
│   │   │   └── components/
│   │   │       ├── CameraFeed.jsx       # ฟีดกล้อง + กรอบ Face Bounding Box + ข้อมูล FPS
│   │   │       ├── StatsOverview.jsx    # แถบสถิติ 4 ช่อง
│   │   │       └── RecentVisitors.jsx   # ลิสต์ผู้มาติดต่อล่าสุด
│   │   │
│   │   ├── training/           # [3] หน้าฐานข้อมูลบุคคล & สถานะเทรน AI
│   │   │   ├── TrainingPage.jsx
│   │   │   └── components/
│   │   │       ├── SearchFilterBar.jsx  # ช่องค้นหาชื่อ + แท็กฟิลเตอร์หมวดหมู่
│   │   │       ├── PersonCard.jsx       # การ์ดแสดงข้อมูลบุคคลและค่า Confidence
│   │   │       ├── ModelStats.jsx       # ข้อมูลสถิติโมเดล YOLO (Epochs, mAP, Dataset Size)
│   │   │       └── GpuConsole.jsx       # หน้าต่างจำลองคอนโซล GPU Log + ปุ่ม Stop/Resume
│   │   │
│   │   ├── add-person/         # [4] หน้าลงทะเบียนบุคคลใหม่ & อัปโหลด Dataset
│   │   │   ├── AddPersonPage.jsx
│   │   │   └── components/
│   │   │       ├── IdentityForm.jsx     # ฟอร์มชื่อ-นามสกุล, เลือก Role/Category
│   │   │       ├── DatasetUploader.jsx  # Dropzone อัปโหลดภาพ (Drag & Drop)
│   │   │       └── WebcamCapture.jsx    # จำลองหรือเปิดกล้องเว็บแคมถ่ายภาพสด
│   │   │
│   │   ├── alerts/             # [5] หน้าระบบแจ้งเตือนความปลอดภัย
│   │   │   ├── AlertsPage.jsx
│   │   │   └── components/
│   │   │       ├── AlertItem.jsx        # แถวการแจ้งเตือน (CRITICAL, HIGH, NORMAL)
│   │   │       └── AlertFilters.jsx     # สลับดู Unread / All และปุ่ม Mark all read
│   │   │
│   │   └── auth/               # [6, 7] หน้าเข้าสู่ระบบและสมัครสมาชิก
│   │       ├── LoginPage.jsx
│   │       └── SignupPage.jsx
│   │
│   ├── hooks/                  # Custom Hooks จัดการ Logic & Real-time Data
│   │   ├── useCameraStream.js  # จัดการ Live Stream / WebSocket จาก ESP32-CAM
│   │   ├── useAlerts.js        # จัดการข้อมูลแจ้งเตือน (กรอง Unread, มาร์กอ่านแล้ว)
│   │   └── usePersons.js       # จัดการค้นหา, กรองหมวดหมู่ และเพิ่มบุคคลใหม่
│   │
│   ├── mocks/                  # Mock Data สำหรับทดสอบ UI แบบไม่ต้องรัน Backend
│   │   ├── mockVisitors.js     # รายชื่อผู้มาติดต่อล่าสุด
│   │   ├── mockPersons.js      # ฐานข้อมูลบุคคล (Employee, Family, VIP, Blacklist)
│   │   ├── mockAlerts.js       # รายการแจ้งเตือนความปลอดภัย
│   │   └── mockModelStats.js   # ข้อมูลสถิติ YOLO และ GPU Log
│   │
│   ├── routes/
│   │   └── routes.tsx          # ตั้งค่าเส้นทาง Routing ทั้งหมด
│   │
│   ├── index.css               # Design Tokens โทนสี Peach & Cream ด้วย Tailwind v4
│   └── main.jsx                # จุดเริ่มต้นของแอปพลิเคชัน
```

---

## 3. รายละเอียดและสเปกแต่ละหน้า (Pages Specification)

### 3.1 หน้าแรก Landing Page (`/`)
- **วัตถุประสงค์:** หน้าต้อนรับ แนะนำภาพรวมระบบ Vigil AI Smart Security
- **องค์ประกอบหลัก:**
  - **Capsule Topbar (`Navbar`)**: เมนูนำทางแบบแคปซูล มีลิงก์ไปหน้า Detection, Training, Alerts และปุ่ม Login / Signup
  - **Hero Section**: หัวข้อเด่น, คำอธิบายระบบ, ภาพกราฟิกจำลองการทำงาน, ปุ่ม `GET STARTED` ลิงก์เข้าสู่ `/detection`
  - **Feature Highlights**: สรุป 3 จุดเด่นสำคัญ (YOLOv8 Face Detection, ESP32-CAM Real-time Streaming, Security Event Alerts)

### 3.2 หน้าตรวจจับใบหน้า & มอนิเตอร์สด (`/detection`)
- **วัตถุประสงค์:** แดชบอร์ดหลักสำหรับ Security Operator เฝ้าระวังภาพสดจากกล้อง
- **องค์ประกอบหลัก:**
  - **Metric Cards (4 ช่อง):**
    1. *Total Visitors Today* (จำนวนผู้มาเยือนทั้งหมด)
    2. *Identified Persons* (ระบุตัวตนได้ - Known)
    3. *Unidentified Persons* (ไม่ทราบตัวตน - Unknown)
    4. *Threats / Blacklist* (บุคคลเฝ้าระวัง / ภัยคุกคาม)
  - **Live Camera Feed:**
    - กล่องแสดงภาพสดจาก ESP32-CAM หรือ Web Stream
    - กรอบจำลอง Face Bounding Box พร้อมป้ายชื่อและ % Confidence
    - ข้อมูล Metadata มุมจอ: นาฬิกาเดินสด (Real-time Clock), FPS, Resolution (เช่น 1280x720 30FPS)
  - **Recent Visitors Sidebar / List:**
    - รายชื่อผู้ที่เพิ่งเดินผ่านกล้องล่าสุด เรียงตามเวลา
    - แสดงภาพ Thumbnail, ชื่อ, เวลาตรวจพบ, และป้าย Badge (`KNOWN` สีเขียว หรือ `UNKNOWN` สีแดง)

### 3.3 หน้าฐานข้อมูลบุคคล & การเทรนโมเดล (`/training`)
- **วัตถุประสงค์:** จัดการคลังข้อมูลบุคคลที่ระบบรู้จัก และติดตามสถานะ AI Model
- **องค์ประกอบหลัก:**
  - **Search & Category Filters:**
    - ช่อง Search ค้นหารายชื่อแบบ Real-time
    - ปุ่มแท็กฟิลเตอร์: `All`, `Employee`, `Family`, `Visitor`, `VIP`, `Blacklist`
    - ปุ่มลัด `+ Add Person` นำทางไปหน้า `/add-person`
  - **People Cards Grid:**
    - การ์ดบุคคลแต่ละคน แสดง Avatar ตัวย่อ, ชื่อ-นามสกุล, แท็กประเภท, จำนวนภาพใน Dataset, และค่า Accuracy Score
  - **YOLO Training Monitor Panel:**
    - สถานะโมเดล: Model Version (`yolov8n-face`), Dataset Size, Current Epoch, mAP@0.5 Score
  - **GPU Console & Terminal:**
    - กล่องคอนโซลสไตล์ Dark CLI แสดงข้อความจำลองการ Train (Loss, Epoch Progress, Learning Rate)
    - ปุ่มควบคุมการเทรน: `Pause Training`, `Resume`, `Retrain Model`

### 3.4 หน้าลงทะเบียนบุคคลใหม่ (`/add-person`)
- **วัตถุประสงค์:** เพิ่มบุคคลใหม่เข้าสู่ฐานข้อมูล Face Recognition
- **องค์ประกอบหลัก:**
  - **Identity Details Form:**
    - ช่องกรอกชื่อและนามสกุล (First Name & Last Name)
    - แท็กเลือกสถานะ/บทบาท (Employee, Family, Visitor, VIP, Blacklist)
    - ช่องหมายเหตุเพิ่มเติม (Notes / Department)
  - **Training Dataset Section:**
    - **Dropzone File Uploader:** ลากไฟล์ภาพใบหน้ามาวาง หรือคลิกเลือกไฟล์
    - **Live Webcam Capture:** จำลองหรือเชื่อมกล้องเว็บแคมเพื่อกดถ่ายภาพสดทีละภาพ
    - **Dataset Counter Badge:** แถบแสดงจำนวนภาพที่เลือก (มีคำแนะนำให้ใส่รูปอย่างน้อย 15 ภาพเพื่อความแม่นยำ)
  - **Action Buttons:** ปุ่ม `Cancel` (ย้อนกลับ) และ `Save & Train` (บันทึกข้อมูลและส่งเข้าคิวเทรน)

### 3.5 หน้าระบบแจ้งเตือนความปลอดภัย (`/alerts`)
- **วัตถุประสงค์:** รวมประวัติเหตุการณ์ความปลอดภัยและภัยคุกคาม
- **องค์ประกอบหลัก:**
  - **Filter Controls:**
    - ปุ่มสลับแท็บ `All Alerts` กับ `Unread Only`
    - ปุ่ม `Mark All as Read` สำหรับเคลียร์สถานะอ่านทั้งหมด
  - **Alert Items List:**
    - รายการแจ้งเตือนแบ่งตาม Severity Level:
      - `CRITICAL` (สีแดงเข้ม): พบบุคคลใน Blacklist
      - `HIGH` (สีส้ม/แดง): พบบุคคลแปลกหน้าในยามวิกาล
      - `NORMAL` (สีฟ้า/เขียว): ตรวจพบบุคคลทั่วไป/พนักงาน
    - แสดงเวลา, ภาพ Snapshot จากกล้อง, รายละเอียดเหตุการณ์, และปุ่มคลิกเพื่อสลับสถานะอ่านแล้ว

### 3.6 หน้าเข้าสู่ระบบ (`/login`) & สมัครสมาชิก (`/signup`)
- **วัตถุประสงค์:** ยืนยันตัวตนเจ้าหน้าที่ดูแลระบบ (Authentication)
- **องค์ประกอบหลัก:**
  - ดีไซน์ Modern Glass Card กึ่งกลางหน้าจอ โทนสีอบอุ่นเข้ากับธีม Vigil
  - ฟิลด์ Email, Password พร้อมระบบ Form Validation
  - สลับไปมาระหว่างหน้า Login และ Signup ได้สะดวกรวดเร็ว

---

## 4. ระบบสีและ Design Tokens (Tailwind CSS v4)

กำหนดค่าตัวแปรตามสเปก Peach & Cream ในไฟล์ [src/index.css](file:///d:/bas/web-iot/frontend/src/index.css):

```css
@import "tailwindcss";

@theme {
  /* Brand Colors (Peach & Cream Modern Aesthetic) */
  --color-vigil-peach: #f5c9a8;
  --color-vigil-peach-dark: #e8b48a;
  --color-vigil-bg: #f7f1e9;
  --color-vigil-card: #ffffff;
  --color-vigil-text: #1a1a1a;
  --color-vigil-muted: #6b6b6b;
  --color-vigil-border: #e8e0d5;

  /* Status Colors */
  --color-vigil-green: #2e7d32;
  --color-vigil-green-bg: #e8f5e9;
  --color-vigil-red: #c62828;
  --color-vigil-red-bg: #ffebee;
  --color-vigil-cyan: #26a69a;
  --color-vigil-cyan-bg: #e0f2f1;
  --color-vigil-yellow: #f9a825;
  --color-vigil-yellow-bg: #fff8e1;
}

body {
  background-color: var(--color-vigil-bg);
  color: var(--color-vigil-text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  margin: 0;
}
```

---

## 5. การตั้งค่า Routing (`src/routes/routes.tsx`)

```tsx
import { createBrowserRouter } from "react-router";
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";

import LandingPage from "../pages/landing/LandingPage";
import DetectionPage from "../pages/detection/DetectionPage";
import TrainingPage from "../pages/training/TrainingPage";
import AddPersonPage from "../pages/add-person/AddPersonPage";
import AlertsPage from "../pages/alerts/AlertsPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/detection", element: <DetectionPage /> },
      { path: "/training", element: <TrainingPage /> },
      { path: "/add-person", element: <AddPersonPage /> },
      { path: "/alerts", element: <AlertsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
]);

export default router;
```

---

## 6. การเชื่อมต่อระบบ IoT & AI Backend ที่ใช้งานจริง (Live Implementation)

1. **ESP32-S3 AI Camera (Static IP 192.168.137.65):**
   - **Direct Stream:** เชื่อมต่อตรงผ่าน `http://192.168.137.65/stream` สำหรับความเร็วสูงสุด Low-Latency
   - **Backend Proxy:** สตรีมผ่าน `/api/v1/detection/esp32-stream?camera_ip=192.168.137.65` เพื่อป้องกันปัญหา Private Network Access / CORS restrictions บน Chrome/Edge 100%
   - **Single Snapshot Capture:** ดึงภาพ JPEG ผ่าน `/api/v1/detection/esp32-snapshot` สำหรับนำเข้าโมเดล YOLO และใช้บันทึกชุดข้อมูลเทรนใบหน้า
2. **Backend Proxy & CORS Handling:**
   - มีระบบ Fallback ถ่ายภาพและสตรีมผ่าน Backend เสมอเมื่อเปิดในเครือข่ายที่มีการบล็อกพอร์ต
3. **Identity Dataset Storage:**
   - รูปภาพทั้งหมดที่ถ่ายจาก ESP32 หรือเว็บแคมถูกส่งเข้า `/api/v1/persons` และบันทึกลงโฟลเดอร์ `backend/data/datasets/person_<id>/` บนเครื่องเซิร์ฟเวอร์อย่างถาวร

---

## 7. ระบบการเทรนใบหน้าจริงใน Frontend (Real Face Training & Dataset Pipeline)

### 7.1 หน้าคอนโซล AI Training (`src/pages/training/TrainingPage.jsx`)
- **Real-time Model Metrics:** ดึงข้อมูลสถิติจริงจาก `GET /api/v1/persons/model-status`
  - สถาปัตยกรรมโมเดล: `MobileNetV3 + Cosine Metric Learning (576-dim L2)`
  - ความแม่นยำเฉลี่ย: คำนวณจาก Intra-class Consistency ของรูปภาพจริง
  - จำนวนโปรไฟล์ที่เทรนและจำนวนตัวอย่างภาพใน Dataset
  - ความเร็ว Inference Time (~13-15 ms บน CPU)
- **Interactive AI Training Terminal:**
  - แสดง Log จริงจากระบบหลังบ้าน พร้อมการแยกสีตามประเภท Log (`[TRAINED]`, `[COMPLETE]`, `[WARN]`, `[SYSTEM]`)
  - ปุ่ม **"เทรนโมเดลใหม่ (Re-train AI)"** สั่งการ `POST /api/v1/persons/train` เพื่อ Re-index เวกเตอร์ใบหน้าของทุกคนใหม่แบบเรียลไทม์
  - ปุ่ม **Pause / Resume** สลับสถานะการตรวจจับใบหน้า
- **Identity Management:**
  - แสดงการ์ดบุคคลจริงจาก SQLite พร้อมสถานะความแม่นยำและจำนวนภาพใน Dataset
  - ปุ่มลบบุคคล (`Trash2`) ที่จะลบข้อมูลทั้งใน SQLite, โฟลเดอร์ Dataset และฐานข้อมูลเวกเตอร์แบบถาวร

### 7.2 หน้าลงทะเบียนและเก็บ Dataset ใบหน้า (`src/pages/add-person/AddPersonPage.jsx`)
- **AI Face Training Quality Guide:**
  - แถบแนะนำคุณภาพ Dataset แบบไดนามิกตามจำนวนภาพที่ถ่าย:
    - *0 ภาพ:* ยังไม่มีภาพถ่าย
    - *1-2 ภาพ:* ความพร้อมพื้นฐาน (แนะนำถ่ายเพิ่ม)
    - *3-5 ภาพ:* ความพร้อมดีเยี่ยม (ครอบคลุมมุมมองมาตรฐาน แนะนำสำหรับการใช้งานจริง)
    - *6+ ภาพ:* ความแม่นยำระดับสูงสุด (High Precision Embedding)
  - แนะนำ 3 มุมมองสำคัญ: **หน้าตรง**, **หันซ้าย-ขวาเล็กน้อย (~15°)**, และ **ยิ้ม/สภาพแสงจริง**
- **Multi-Source Capture & Burst Mode:**
  - รองรับการจับภาพทั้งจาก **ESP32-S3 AI Camera** (`192.168.137.65`), **กล้องเว็บแคม**, และ **การอัปโหลดไฟล์**
  - โหมดถ่ายรัวอัตโนมัติ (Burst Mode 3 shots) เพื่อให้ผู้ใช้หันหน้าเปลี่ยนมุมได้สะดวกขณะเก็บ Dataset
- **Automatic Augmentation Pipeline:**
  - เมื่อกดบันทึก Backend จะทำการ Mirror และ Normalize เวกเตอร์ เพื่อให้จำหน้าได้แม้เอียงมุมในการตรวจจับจริง

---

## 8. ระบบตรวจจับอัตโนมัติและการแจ้งเตือนแบบต่อเนื่อง (Continuous Detection & Alert System)

### 8.1 การแก้ปัญหาการหยุดตรวจจับ (Continuous Auto-Detection Architecture)
- **Persistent Interval via useRef Guard (`isDetectingRef`):**
  - ใน `src/pages/detection/DetectionPage.jsx` การใช้ state `isDetecting` ใน Dependency Array ของ `useEffect` จะทำให้ timer ถูก `clearInterval` ทุกครั้งที่มีการอัปเดตสถานะตรวจจับ เป็นสาเหตุให้ระบบตรวจจับหยุดทำงานหลังจากทำงานไปเพียง 1-2 ครั้ง
  - **การปรับปรุง:** ปรับมาใช้ `isDetectingRef = useRef(false)` เพื่อทำหน้าที่เป็น In-flight guard โดยไม่ทำให้ `useEffect` Re-mount หรือทำลาย Interval ทิ้ง ทำให้ตัวตั้งเวลา (Timer Interval 3s) ทำงานต่อเนื่องสม่ำเสมอไม่มีวันหยุด
- **Zero-Latency Canvas Frame Capture:**
  - เมื่อกล้องเปิด Live Stream (ESP32 หรือ WebCam) ฟังก์ชัน `handleRunYoloDetection` จะดึงภาพปัจจุบันจากองค์ประกอบ `<img id="esp32-stream-img">` หรือ `<video>` ผ่าน HTML5 Canvas
  - แปลงภาพเป็น JPEG Blob ส่งไปยัง Endpoint `/api/v1/detection/detect-image` ทันที
  - ประโยชน์:
    1. **แก้ปัญหา ESP32 Single-threaded Hang:** ไม่แย่ง Connection กับบอร์ด ESP32 ที่กำลังสตรีม MJPEG อยู่
    2. **Real-time Synchronization:** ภาพที่ส่งไปตรวจจับคือภาพเดียวกับที่ปรากฏบนจอ 100%
    3. **ความเร็วสูง:** ลดเวลา Round-trip Network Latency

### 8.2 ระบบเสียงเตือนอัตโนมัติ (Web Audio API Chimes)
- หน้าตรวจจับติดตั้ง Audio Synthesizer ผ่าน Web Audio API โดยไม่ต้องพึ่งพาไฟล์เสียง `.mp3` ภายนอกที่อาจโหลดไม่ติด:
  - **Stranger Alert (บุคคลแปลกหน้า):** เสียงไซเรนเตือนภัย 2 โทนความถี่สูง (880Hz -> 587Hz)
  - **Delivery Courier (พนักงานส่งพัสดุ):** เสียงกระดิ่งคอร์ดแจ้งเตือน 2 จังหวะ (523Hz -> 659Hz)
  - **Household Member (คนในบ้าน):** เสียงกระดิ่งต้อนรับ (659Hz -> 880Hz)
- มีปุ่มสลับเปิด/ปิดเสียงเตือน (`Volume2` / `VolumeX`) บนแถบ Camera Controls เพื่อความสะดวกในการใช้งาน
- ส่ง Event `vigil-alerts-updated` ไปยัง Navbar ทันทีเพื่ออัปเดต Badge ตัวเลขสีแดงบนไอคอนกระดิ่งแบบเรียลไทม์

