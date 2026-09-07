import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import {
  UserPlus,
  UploadCloud,
  Camera,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Home,
  Package,
  ShieldAlert,
  Video,
  VideoOff,
  RefreshCw,
  FlipHorizontal,
  Star,
  SlidersHorizontal,
  Layers,
  Wifi,
  WifiOff,
  Check,
  CheckCircle2,
  ExternalLink,
  Timer,
  Maximize2,
  Info,
} from "lucide-react";
import { Input, Textarea } from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import { personsApi, detectionApi } from "../../services/api";

const DEFAULT_ESP32_IP = "192.168.137.65";

export default function AddPersonPage() {
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState("");
  const [category, setCategory] = useState("household"); // "household", "delivery", "stranger"
  const [role, setRole] = useState("Family");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState([]);
  const [primaryImageId, setPrimaryImageId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ==========================================
  // Embedded Camera Console State
  // Default to "esp32" so ESP32-CAM is attached immediately
  // ==========================================
  const [activeSourceTab, setActiveSourceTab] = useState("esp32"); // "esp32" | "webcam" | "upload"
  const [isModalOpen, setIsModalOpen] = useState(false); // Optional fullscreen modal

  // ESP32-CAM Specific State
  const [esp32Ip, setEsp32Ip] = useState(() => {
    return localStorage.getItem("esp32_cam_ip") || DEFAULT_ESP32_IP;
  });
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [tempEsp32Ip, setTempEsp32Ip] = useState(esp32Ip);
  const [esp32StreamStatus, setEsp32StreamStatus] = useState("connecting"); // "online" | "offline" | "connecting"
  const [esp32Key, setEsp32Key] = useState(() => Date.now());
  const [useProxyStream, setUseProxyStream] = useState(false);
  const [isCapturingEsp32, setIsCapturingEsp32] = useState(false);

  // Webcam Specific State
  const [cameraActive, setCameraActive] = useState(false);
  const [webcamError, setWebcamError] = useState("");
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [isMirrored, setIsMirrored] = useState(true);

  // Capture Effects & Multi-Shot (Burst) State
  const [shutterFlash, setShutterFlash] = useState(false);
  const [countdown, setCountdown] = useState(null); // null | 3 | 2 | 1
  const [isBurstMode, setIsBurstMode] = useState(false);
  const [burstCount, setBurstCount] = useState({ current: 0, total: 0 });

  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);
  const streamRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const categories = [
    {
      id: "household",
      label: "คนในบ้าน (Household)",
      description: "สมาชิกในครอบครัวและผู้พักอาศัย",
      icon: Home,
      color: "border-[#81c784] bg-[#e8f5e9]/60 text-[#2e7d32]",
      activeColor: "border-[#2e7d32] bg-[#c8e6c9] text-[#1b5e20] shadow-sm",
    },
    {
      id: "delivery",
      label: "คนส่งของ (Delivery)",
      description: "เจ้าหน้าที่พัสดุและไรเดอร์ขนส่ง",
      icon: Package,
      color: "border-[#ffb74d] bg-[#fff3e0]/60 text-[#e65100]",
      activeColor: "border-[#e65100] bg-[#ffe0b2] text-[#bf360c] shadow-sm",
    },
    {
      id: "stranger",
      label: "คนแปลกหน้า (Stranger)",
      description: "บุคคลภายนอกที่ต้องการจับตาเฝ้าระวัง",
      icon: ShieldAlert,
      color: "border-[#e57373] bg-[#ffebee]/60 text-[#c62828]",
      activeColor: "border-[#c62828] bg-[#ffcdd2] text-[#b71c1c] shadow-sm",
    },
  ];

  const minRecommendedImages = 15;

  // Helper: Convert Blob to Base64 Data URL
  const blobToDataUrl = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper: Add image to dataset state
  const addImageToDataset = (dataUrl, source = "camera") => {
    const newImg = {
      id: Math.random().toString(36).substring(2, 9),
      name: `${source}_${Date.now()}.jpg`,
      url: dataUrl,
      source: source,
    };
    setImages((prev) => {
      const updated = [...prev, newImg];
      if (updated.length === 1 || !primaryImageId) {
        setPrimaryImageId(newImg.id);
      }
      return updated;
    });
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: null }));
    }
  };

  // File Upload Handler (Base64 conversion)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        addImageToDataset(uploadEvent.target.result, "upload");
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (primaryImageId === id) {
        setPrimaryImageId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const setAsPrimary = (id) => {
    setPrimaryImageId(id);
  };

  const triggerShutterFlash = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 180);
  };

  // ==========================================
  // Webcam Lifecycle Engine
  // ==========================================
  const stopWebcamStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    if (modalVideoRef.current) modalVideoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const startWebcamStream = useCallback(async (deviceId = "") => {
    stopWebcamStream();
    setWebcamError("");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setWebcamError("เบราว์เซอร์นี้ไม่รองรับ Camera API หรือโปรโตคอลความปลอดภัย (HTTPS/localhost)");
      return;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }),
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = allDevices.filter((d) => d.kind === "videoinput");
        setAvailableDevices(videoInputs);
      } catch (enumErr) {
        console.warn("Could not enumerate camera devices:", enumErr);
      }

      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = stream;
        modalVideoRef.current.play().catch(console.warn);
      }
    } catch (err) {
      console.error("Webcam access error:", err);
      let msg = "ไม่สามารถเข้าถึงกล้องเว็บแคมได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงกล้อง";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "คุณปฏิเสธการเข้าถึงกล้อง กรุณากดอนุญาตสิทธิ์ที่แถบ URL ของเบราว์เซอร์";
      } else if (err.name === "NotFoundError") {
        msg = "ไม่พบอุปกรณ์กล้องเว็บแคมที่เชื่อมต่อ";
      }
      setWebcamError(msg);
      setCameraActive(false);
    }
  }, [stopWebcamStream]);

  // Handle video element mounting
  const handleVideoRef = useCallback((element) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch(console.warn);
    }
  }, []);

  const handleModalVideoRef = useCallback((element) => {
    modalVideoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch(console.warn);
    }
  }, []);

  // Manage webcam start/stop when switching tabs
  useEffect(() => {
    if (activeSourceTab === "webcam" || (isModalOpen && activeSourceTab === "webcam")) {
      startWebcamStream(selectedDeviceId);
    } else {
      stopWebcamStream();
    }
    return () => {
      stopWebcamStream();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [activeSourceTab, selectedDeviceId, startWebcamStream, stopWebcamStream, isModalOpen]);

  // Capture current webcam frame
  const captureWebcamFrame = useCallback(() => {
    const video = isModalOpen && modalVideoRef.current ? modalVideoRef.current : videoRef.current;
    if (!video || !cameraActive) return null;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.92);
  }, [cameraActive, isMirrored, isModalOpen]);

  const handleCaptureWebcamSingle = () => {
    const dataUrl = captureWebcamFrame();
    if (!dataUrl) return;
    triggerShutterFlash();
    addImageToDataset(dataUrl, "webcam");
  };

  // Burst capture for webcam
  const handleStartBurstCaptureWebcam = (totalShots = 3) => {
    if (isBurstMode || countdown !== null) return;
    setIsBurstMode(true);
    setBurstCount({ current: 0, total: totalShots });

    let currentShot = 0;
    const takeNext = () => {
      let count = 2;
      setCountdown(count);

      countdownIntervalRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countdownIntervalRef.current);
          setCountdown(null);

          const dataUrl = captureWebcamFrame();
          if (dataUrl) {
            triggerShutterFlash();
            currentShot += 1;
            setBurstCount({ current: currentShot, total: totalShots });
            addImageToDataset(dataUrl, "webcam");
          }

          if (currentShot < totalShots) {
            setTimeout(takeNext, 700);
          } else {
            setIsBurstMode(false);
          }
        }
      }, 700);
    };

    takeNext();
  };

  // ==========================================
  // ESP32-CAM Engine (Direct + Proxy)
  // ==========================================
  const esp32StreamSrc = useProxyStream
    ? detectionApi.getEsp32StreamUrl(esp32Ip)
    : `http://${esp32Ip}/stream?t=${esp32Key}`;

  const handleSaveEsp32Ip = (e) => {
    if (e) e.preventDefault();
    const cleanIp = tempEsp32Ip.trim().replace(/^https?:\/\//, "").split("/")[0] || DEFAULT_ESP32_IP;
    setEsp32Ip(cleanIp);
    localStorage.setItem("esp32_cam_ip", cleanIp);
    setEsp32StreamStatus("connecting");
    setUseProxyStream(false);
    setEsp32Key(Date.now());
    setIsEditingIp(false);
  };

  const handleStreamError = () => {
    if (!useProxyStream) {
      console.warn("Direct ESP32 stream failed, switching to Backend Proxy stream...");
      setUseProxyStream(true);
      setEsp32StreamStatus("connecting");
    } else {
      setEsp32StreamStatus("offline");
    }
  };

  const handleCaptureEsp32 = async () => {
    setIsCapturingEsp32(true);
    try {
      let dataUrl = null;

      // 1. Try direct fetch
      if (!useProxyStream) {
        try {
          const directUrl = `http://${esp32Ip}/capture?t=${Date.now()}`;
          const resp = await fetch(directUrl, { mode: "cors", cache: "no-cache" });
          if (resp.ok) {
            const blob = await resp.blob();
            dataUrl = await blobToDataUrl(blob);
          }
        } catch (directErr) {
          console.warn("Direct ESP32 capture failed, using backend proxy:", directErr);
        }
      }

      // 2. Fallback to Backend Proxy snapshot
      if (!dataUrl) {
        const blob = await detectionApi.fetchEsp32SnapshotBlob(esp32Ip);
        dataUrl = await blobToDataUrl(blob);
      }

      if (dataUrl) {
        triggerShutterFlash();
        addImageToDataset(dataUrl, "esp32");
      }
    } catch (err) {
      console.error("ESP32 snapshot capture error:", err);
    } finally {
      setIsCapturingEsp32(false);
    }
  };

  // Burst capture for ESP32 (3 shots with 1s interval)
  const handleStartBurstCaptureEsp32 = async (totalShots = 3) => {
    if (isBurstMode) return;
    setIsBurstMode(true);
    setBurstCount({ current: 0, total: totalShots });

    for (let i = 1; i <= totalShots; i++) {
      setBurstCount({ current: i, total: totalShots });
      await handleCaptureEsp32();
      if (i < totalShots) {
        await new Promise((r) => setTimeout(r, 900));
      }
    }
    setIsBurstMode(false);
  };

  // ==========================================
  // Form Submit Handler
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "กรุณากรอกชื่อ-นามสกุล";
    if (images.length === 0) newErrors.images = "กรุณาถ่ายภาพหรืออัปโหลดรูปภาพใบหน้าอย่างน้อย 1 รูป";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const primary = images.find((img) => img.id === primaryImageId) || images[0];
      const photoUrl = primary ? primary.url : "";

      await personsApi.createPerson({
        name: fullName.trim(),
        category: category,
        role:
          category === "household"
            ? role || "Family"
            : category === "delivery"
            ? "Delivery"
            : "Stranger",
        department:
          department.trim() ||
          (category === "household"
            ? "Residence"
            : category === "delivery"
            ? "Courier"
            : "Unknown"),
        notes: notes.trim(),
        photo_url: photoUrl,
        dataset_images: images.map((img) => img.url),
        accuracy: 98.5,
        images_count: images.length,
        is_active: true,
      });

      navigate("/training");
    } catch (err) {
      console.error("Could not save person to backend:", err);
      navigate("/training");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.min(100, Math.round((images.length / minRecommendedImages) * 100));

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-2">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Link
            to="/training"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปหน้ารายชื่อบุคคล
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
            ลงทะเบียนบุคคลใหม่ (Register Identity)
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b]">
            เชื่อมต่อกล้อง IoT ESP32-CAM และเว็บแคมเพื่อเก็บชุดข้อมูลใบหน้าสำหรับโมเดล YOLOv8
          </p>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Section 1: Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e0d5] shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#e8e0d5]">
            <div className="w-8 h-8 rounded-xl bg-[#f5c9a8] flex items-center justify-center text-[#1a1a1a]">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#1a1a1a]">
              1. ข้อมูลบุคคลและประเภทการเข้าออก
            </h3>
          </div>

          {/* Classification Category Cards */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
              ประเภทบุคคล (Classification Category) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const active = category === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (cat.id === "household") setRole("Family");
                      else if (cat.id === "delivery") setRole("Delivery");
                      else setRole("Stranger");
                    }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col gap-2 ${
                      active ? cat.activeColor : cat.color
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <IconComponent className="w-5 h-5" />
                      {active && (
                        <span className="w-2.5 h-2.5 rounded-full bg-current" />
                      )}
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-bold block">
                        {cat.label}
                      </strong>
                      <span className="text-[11px] opacity-80 leading-tight block mt-0.5">
                        {cat.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="ชื่อ-นามสกุล *"
              placeholder="เช่น สมชาย รักสงบ, ไรเดอร์ Grab"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((prev) => ({ ...prev, fullName: null }));
              }}
              error={errors.fullName}
            />

            <Input
              label="แผนก / สังกัด / บริษัทขนส่ง"
              placeholder="เช่น สมาชิกในบ้าน, Flash Express, Grab Food"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>

          <Textarea
            label="บันทึกความปลอดภัยและสิทธิเข้าออก"
            placeholder="เช่น สมาชิกในบ้านอนุญาต 24 ชม., คนส่งของให้แจ้งเตือนเมื่อมาถึง..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* =================================================================== */}
        {/* Section 2: Interactive In-Page Camera Console (ESP32-CAM + Webcam) */}
        {/* =================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e0d5] shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e0d5]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e0f2f1] flex items-center justify-center text-[#26a69a]">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">
                  2. กล้องถ่ายภาพใบหน้าสด & ชุดข้อมูล ({images.length} รูป)
                </h3>
                <span className="text-xs text-[#6b6b6b]">
                  สตรีมสดจากบอร์ด ESP32-S3 AI Camera หรือเว็บแคมในเครื่อง
                </span>
              </div>
            </div>

            {/* Progress Bar Badge */}
            <div className="flex items-center gap-3">
              <div className="w-32 h-2.5 bg-[#f7f1e9] rounded-full overflow-hidden border border-[#e8e0d5]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress >= 100 ? "bg-[#2e7d32]" : "bg-[#f5c9a8]"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1a1a1a]">
                {images.length}/15 รูป
              </span>
            </div>
          </div>

          {/* AI Face Training Quality Tips Banner */}
          <div className="bg-[#fcfaf7] rounded-2xl p-4 border border-[#f0e4d7] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e65100]" />
                <strong className="text-xs font-bold text-[#1a1a1a]">
                  คำแนะนำสำหรับการเทรนใบหน้าให้ได้ผลลัพธ์แม่นยำสูงสุด (AI Dataset Quality)
                </strong>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                images.length === 0
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : images.length < 3
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : images.length < 6
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold"
              }`}>
                {images.length === 0
                  ? "ยังไม่มีภาพถ่าย"
                  : images.length < 3
                  ? "ความพร้อมพื้นฐาน (ควรถ่ายเพิ่ม)"
                  : images.length < 6
                  ? "ความพร้อมดีเยี่ยม (แนะนำ)"
                  : "ความแม่นยำระดับสูงสุด"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#6b6b6b] pt-1 border-t border-[#f0e4d7]/70">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e65100]" />
                <span><strong>มุมที่ 1:</strong> หน้าตรง ไม่เอียงหน้า</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e65100]" />
                <span><strong>มุมที่ 2:</strong> หันซ้าย-ขวาเล็กน้อย (~15°)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e65100]" />
                <span><strong>มุมที่ 3:</strong> ยิ้ม หรือสภาพแสงจริง</span>
              </div>
            </div>
          </div>

          {/* Source Tabs Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f7f1e9] border border-[#e8e0d5]">
              <button
                type="button"
                onClick={() => setActiveSourceTab("esp32")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSourceTab === "esp32"
                    ? "bg-[#e65100] text-white shadow-xs"
                    : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                }`}
              >
                <Wifi className="w-4 h-4" />
                กล้อง IoT (ESP32-CAM)
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceTab("webcam")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSourceTab === "webcam"
                    ? "bg-[#1a1a1a] text-white shadow-xs"
                    : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                }`}
              >
                <Video className="w-4 h-4" />
                กล้องเว็บแคม (Webcam)
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceTab("upload")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSourceTab === "upload"
                    ? "bg-[#1a1a1a] text-white shadow-xs"
                    : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                อัปโหลดไฟล์
              </button>
            </div>

            {/* Expand Viewport Button */}
            {activeSourceTab !== "upload" && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#e8e0d5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#e8b48a] shadow-2xs cursor-pointer transition-all"
                title="ขยายมุมมองกล้องเต็มจอ"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>ขยายมุมมอง</span>
              </button>
            )}
          </div>

          {/* ======================================== */}
          {/* TAB 1: EMBEDDED ESP32-CAM LIVE STREAM    */}
          {/* ======================================== */}
          {activeSourceTab === "esp32" && (
            <div className="flex flex-col gap-4">
              {/* ESP32 IP & Connection Status Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e65100]" />
                  <span className="text-xs font-bold text-[#1a1a1a]">
                    ESP32-S3 Node:
                  </span>
                  {!isEditingIp ? (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white border border-[#e8e0d5] text-[#1a1a1a]">
                      {esp32Ip}
                    </span>
                  ) : (
                    <form onSubmit={handleSaveEsp32Ip} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tempEsp32Ip}
                        onChange={(e) => setTempEsp32Ip(e.target.value)}
                        placeholder="192.168.137.65"
                        className="font-mono text-xs px-2 py-1 rounded-lg bg-white border border-[#e8b48a] outline-none w-36"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#2e7d32] text-white cursor-pointer"
                      >
                        บันทึก
                      </button>
                    </form>
                  )}
                  {!isEditingIp && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempEsp32Ip(esp32Ip);
                        setIsEditingIp(true);
                      }}
                      className="text-[11px] text-[#e8b48a] hover:underline font-semibold cursor-pointer"
                    >
                      เปลี่ยน IP
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {esp32StreamStatus === "online" ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#e8f5e9] text-[#2e7d32] px-2.5 py-1 rounded-lg border border-[#a5d6a7]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-ping" />
                      LIVE FEED
                    </span>
                  ) : esp32StreamStatus === "connecting" ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#e3f2fd] text-[#1565c0] px-2.5 py-1 rounded-lg border border-[#bbdefb]">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      CONNECTING...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#ffebee] text-[#c62828] px-2.5 py-1 rounded-lg border border-[#ffcdd2]">
                      OFFLINE
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEsp32StreamStatus("connecting");
                      setUseProxyStream(false);
                      setEsp32Key(Date.now());
                    }}
                    title="รีเฟรชการเชื่อมต่อสตรีม"
                    className="p-1 rounded-lg bg-white border border-[#e8e0d5] text-[#6b6b6b] hover:text-[#1a1a1a] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Embedded Live Video Viewport */}
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-16/10 sm:aspect-16/9 flex items-center justify-center border border-[#e8e0d5] shadow-xs group">
                <img
                  key={`inline-esp32-${esp32Ip}-${esp32Key}-${useProxyStream}`}
                  src={esp32StreamSrc}
                  alt="ESP32-CAM Live MJPEG Stream"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    esp32StreamStatus === "offline" ? "opacity-20" : "opacity-100"
                  }`}
                  onLoad={() => setEsp32StreamStatus("online")}
                  onError={handleStreamError}
                />

                {/* Shutter Flash Animation */}
                {shutterFlash && (
                  <div className="absolute inset-0 bg-white opacity-80 pointer-events-none z-30 transition-opacity duration-150" />
                )}

                {/* Burst Mode Status Banner */}
                {isBurstMode && (
                  <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-white/20 z-20 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>กำลังถ่ายภาพต่อเนื่อง ({burstCount.current}/{burstCount.total})</span>
                  </div>
                )}

                {/* Offline Fallback State */}
                {esp32StreamStatus === "offline" && (
                  <div className="absolute inset-0 bg-neutral-900/92 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                    <div className="w-12 h-12 rounded-2xl bg-[#c62828]/15 border border-[#c62828]/30 flex items-center justify-center mb-2">
                      <WifiOff className="w-6 h-6 text-[#ef5350]" />
                    </div>
                    <span className="text-sm font-bold text-white mb-1">
                      ไม่สามารถเชื่อมต่อกล้อง ESP32-CAM ได้ ({esp32Ip})
                    </span>
                    <span className="text-xs text-neutral-300 max-w-sm mb-4 leading-relaxed">
                      ตรวจสอบว่าบอร์ดเปิดใช้งานและเชื่อมต่อ Wi-Fi แล้ว หรือสามารถกดถ่ายภาพ Snapshot ผ่าน Backend Proxy ได้ทันที
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setEsp32StreamStatus("connecting");
                          setUseProxyStream(true);
                          setEsp32Key(Date.now());
                        }}
                        icon={RefreshCw}
                      >
                        สตรีมผ่าน Backend Proxy
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCaptureEsp32}
                        icon={Camera}
                      >
                        ดึง Snapshot ตอนนี้
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Single Snapshot + Burst Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#6b6b6b]">
                    สตรีมสดจากบอร์ด DFRobot ESP32-S3 (OV3660)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleStartBurstCaptureEsp32(3)}
                    disabled={isCapturingEsp32 || isBurstMode}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#fff3e0] text-[#e65100] border border-[#ffb74d] hover:bg-[#ffe0b2] disabled:opacity-50 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    ถ่ายต่อเนื่อง 3 รูป
                  </button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleCaptureEsp32}
                    disabled={isCapturingEsp32 || isBurstMode}
                    icon={Camera}
                    className="bg-[#e65100] hover:bg-[#bf360c] text-white border-none shadow-sm"
                  >
                    {isCapturingEsp32 ? "กำลังบันทึกภาพ..." : "ถ่ายภาพจาก ESP32 (Snapshot)"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 2: EMBEDDED WEBCAM LIVE VIDEO        */}
          {/* ======================================== */}
          {activeSourceTab === "webcam" && (
            <div className="flex flex-col gap-4">
              {/* Webcam Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
                <div className="flex items-center gap-2">
                  {availableDevices.length > 1 && (
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="bg-white border border-[#e8e0d5] text-xs font-semibold text-[#1a1a1a] rounded-xl px-2.5 py-1 outline-none cursor-pointer hover:border-[#e8b48a]"
                    >
                      {availableDevices.map((dev, i) => (
                        <option key={dev.deviceId || i} value={dev.deviceId}>
                          {dev.label || `กล้อง ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsMirrored(!isMirrored)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isMirrored
                        ? "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]"
                        : "bg-white text-[#6b6b6b] border-[#e8e0d5]"
                    }`}
                    title="กลับด้านภาพแนวนอน (Mirror)"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Mirror {isMirrored ? "เปิด" : "ปิด"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2e7d32]">
                    <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
                    กล้องพร้อมทำงาน
                  </span>
                </div>
              </div>

              {/* Embedded Video Viewport */}
              <div className="relative rounded-3xl overflow-hidden bg-black aspect-16/10 sm:aspect-16/9 flex items-center justify-center border border-[#e8e0d5] shadow-xs">
                <video
                  ref={handleVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    isMirrored ? "scale-x-[-1]" : ""
                  } ${cameraActive ? "block" : "hidden"}`}
                />

                {/* Shutter Flash Animation */}
                {shutterFlash && (
                  <div className="absolute inset-0 bg-white opacity-80 pointer-events-none z-30 transition-opacity duration-150" />
                )}

                {/* Countdown Overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-40 animate-in zoom-in-75 duration-200">
                    <span className="text-7xl font-black text-white drop-shadow-md font-mono animate-pulse">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Burst Mode Status Banner */}
                {isBurstMode && (
                  <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-3.5 py-1.5 rounded-xl border border-white/20 z-20 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>กำลังถ่ายต่อเนื่อง ({burstCount.current}/{burstCount.total})</span>
                  </div>
                )}

                {!cameraActive && (
                  <div className="p-6 text-center text-white flex flex-col items-center gap-3">
                    <Camera className="w-12 h-12 text-[#f5c9a8]" />
                    <span className="text-xs font-medium text-neutral-300 max-w-sm">
                      {webcamError || "กำลังเชื่อมต่อกับกล้องเว็บแคม..."}
                    </span>
                    {webcamError && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={RefreshCw}
                        onClick={() => startWebcamStream(selectedDeviceId)}
                      >
                        ลองใหม่อีกครั้ง
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#f7f1e9]/60 border border-[#e8e0d5]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6b6b6b]">โหมดถ่ายภาพ:</span>
                  <button
                    type="button"
                    onClick={() => handleStartBurstCaptureWebcam(3)}
                    disabled={!cameraActive || isBurstMode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#fff3e0] text-[#e65100] border border-[#ffb74d] hover:bg-[#ffe0b2] disabled:opacity-50 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    ถ่ายต่อเนื่อง 3 รูป
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartBurstCaptureWebcam(5)}
                    disabled={!cameraActive || isBurstMode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#e3f2fd] text-[#1565c0] border border-[#90caf9] hover:bg-[#bbdefb] disabled:opacity-50 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    ถ่ายต่อเนื่อง 5 รูป
                  </button>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleCaptureWebcamSingle}
                  disabled={!cameraActive || isBurstMode}
                  icon={Camera}
                  className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white border-none shadow-sm"
                >
                  ถ่ายภาพ (Single Shot)
                </Button>
              </div>
            </div>
          )}

          {/* ======================================== */}
          {/* TAB 3: FILE DRAG & DROP UPLOAD           */}
          {/* ======================================== */}
          {activeSourceTab === "upload" && (
            <label className="border-2 border-dashed border-[#e8e0d5] hover:border-[#e8b48a] rounded-3xl p-8 flex flex-col items-center justify-center gap-4 bg-[#f7f1e9]/40 hover:bg-[#f7f1e9] transition-all cursor-pointer group text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e0d5] flex items-center justify-center text-[#6b6b6b] group-hover:text-[#e8b48a] group-hover:scale-105 transition-all shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#1a1a1a] block">
                  คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่
                </span>
                <span className="text-xs text-[#6b6b6b] block mt-1">
                  รองรับ JPG, PNG, WEBP (เลือกได้พร้อมกันหลายไฟล์)
                </span>
              </div>
              <span className="text-xs font-bold text-[#1a1a1a] px-4 py-2 rounded-xl bg-white border border-[#e8e0d5] group-hover:border-[#e8b48a] transition-colors shadow-2xs">
                เลือกไฟล์จากคอมพิวเตอร์
              </span>
            </label>
          )}

          {errors.images && (
            <div className="text-xs text-[#c62828] font-semibold flex items-center gap-1.5 p-3 rounded-xl bg-[#ffebee] border border-[#ffcdd2]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.images}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* Captured / Uploaded Dataset Thumbnails Gallery            */}
          {/* ========================================================= */}
          {images.length > 0 && (
            <div className="flex flex-col gap-3 pt-3 border-t border-[#e8e0d5]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1a1a1a]">
                    ชุดรูปภาพใบหน้า ({images.length} รูป)
                  </span>
                  <span className="text-[11px] text-[#6b6b6b]">
                    (คลิกรูปดาว ⭐ เพื่อกำหนดรูปโปรไฟล์หลัก)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="text-xs text-[#c62828] hover:underline font-semibold cursor-pointer"
                >
                  ลบทั้งหมด
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {images.map((img, idx) => {
                  const isPrimary = (primaryImageId === img.id) || (!primaryImageId && idx === 0);
                  return (
                    <div
                      key={img.id}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 bg-neutral-100 shadow-2xs transition-all ${
                        isPrimary
                          ? "border-[#f9a825] ring-2 ring-[#f9a825]/40"
                          : "border-[#e8e0d5] hover:border-[#e8b48a]"
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Avatar Star Badge */}
                      {isPrimary && (
                        <div className="absolute top-1.5 left-1.5 bg-[#f9a825] text-white p-1 rounded-lg shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}

                      {/* Source tag */}
                      {img.source && (
                        <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-[9px] text-white font-mono px-1 rounded">
                          {img.source === "webcam" ? "CAM" : img.source === "esp32" ? "IoT" : "FILE"}
                        </span>
                      )}

                      {/* Hover Actions: Star & Delete */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setAsPrimary(img.id)}
                          title="ตั้งเป็นภาพโปรไฟล์หลัก"
                          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                            isPrimary
                              ? "bg-[#f9a825] text-white"
                              : "bg-white/80 text-[#1a1a1a] hover:bg-white"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isPrimary ? "fill-current" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          title="ลบรูปภาพนี้"
                          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Training Information Banner */}
        {images.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-[#e8f5e9]/70 border border-[#c8e6c9] rounded-2xl">
            <div className="p-2 bg-[#c8e6c9] text-[#1b5e20] rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 text-xs text-[#2e7d32]">
              <span className="font-bold text-sm text-[#1b5e20]">
                พร้อมเทรนใบหน้าเข้าสู่ระบบ AI จดจำบุคคล
              </span>
              <p className="text-[#388e3c] leading-relaxed">
                ระบบจะนำภาพถ่ายทั้งหมด {images.length} ภาพไปสกัด 576-dim Face Embeddings และคำนวณเวกเตอร์เฉลี่ย เพื่อให้ระบบตรวจจับ YOLO จดจำ {fullName || "บุคคลนี้"} และส่งการแจ้งเตือนระบุชื่ออัตโนมัติ
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate("/training")}
          >
            ยกเลิก
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            icon={Sparkles}
          >
            {isSubmitting ? "กำลังสกัดเวกเตอร์ & เทรนโมเดล..." : "บันทึกและเทรนใบหน้าบุคคล"}
          </Button>
        </div>
      </form>

      {/* Fullscreen / Expanded Camera Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="มุมมองกล้องขนาดใหญ่ (Expanded Camera View)"
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-16/10 flex items-center justify-center border border-[#e8e0d5]">
            {activeSourceTab === "esp32" ? (
              <img
                src={esp32StreamSrc}
                alt="ESP32 Live Stream"
                className="w-full h-full object-cover"
                onError={handleStreamError}
              />
            ) : (
              <video
                ref={handleModalVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? "scale-x-[-1]" : ""}`}
              />
            )}

            {shutterFlash && (
              <div className="absolute inset-0 bg-white opacity-80 pointer-events-none z-30 transition-opacity duration-150" />
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#6b6b6b]">
              มีรูปภาพในเซสชัน: <strong>{images.length}</strong> / 15 รูป
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                ปิด
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={activeSourceTab === "esp32" ? handleCaptureEsp32 : handleCaptureWebcamSingle}
                icon={Camera}
              >
                ถ่ายภาพทันที
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}


