import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Camera,
  Eye,
  EyeOff,
  Clock,
  Radio,
  RefreshCw,
  Wifi,
  WifiOff,
  ExternalLink,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import MetricCard from "../../components/common/MetricCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { initialVisitors } from "../../mocks/mockVisitors";

const DEFAULT_IP = "192.168.137.112";
const DEFAULT_PATH = "/stream";
const DEFAULT_STREAM_URL = `http://${DEFAULT_IP}${DEFAULT_PATH}`;

// Helper to construct full stream URL
const buildStreamUrl = (ip, port, path) => {
  const cleanIp = ip.trim();
  if (cleanIp.startsWith("http://") || cleanIp.startsWith("https://")) {
    return cleanIp;
  }
  const cleanPort = port && port.trim() ? `:${port.trim()}` : "";
  const cleanPath = path && path.trim()
    ? path.trim().startsWith("/")
      ? path.trim()
      : `/${path.trim()}`
    : DEFAULT_PATH;
  return `http://${cleanIp}${cleanPort}${cleanPath}`;
};

// Helper to extract IP, port, and path from a URL
const parseStreamUrl = (url) => {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `http://${url}`);
    return {
      ip: parsed.hostname || DEFAULT_IP,
      port: parsed.port || "",
      path: parsed.pathname || DEFAULT_PATH,
    };
  } catch {
    return { ip: DEFAULT_IP, port: "", path: DEFAULT_PATH };
  }
};

export default function DetectionPage() {
  const [visitors] = useState(initialVisitors);
  const [showBoxes, setShowBoxes] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState("cam-1");
  const [currentTime, setCurrentTime] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Camera IP & Stream Configuration State
  const [cameraIp, setCameraIp] = useState(() => {
    return localStorage.getItem("esp32_cam_ip") || DEFAULT_IP;
  });
  const [streamUrl, setStreamUrl] = useState(() => {
    return localStorage.getItem("esp32_cam_stream_url") || DEFAULT_STREAM_URL;
  });
  const [streamMode, setStreamMode] = useState(() => {
    return localStorage.getItem("esp32_cam_mode") || "live"; // "live" | "demo"
  });
  const [streamStatus, setStreamStatus] = useState("connecting"); // "online" | "offline" | "connecting"
  const [streamKey, setStreamKey] = useState(() => Date.now()); // for reconnecting/cache busting
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal temporary form states
  const parsed = parseStreamUrl(streamUrl);
  const [tempIp, setTempIp] = useState(cameraIp);
  const [tempPort, setTempPort] = useState(parsed.port);
  const [tempPath, setTempPath] = useState(parsed.path || DEFAULT_PATH);
  const [tempMode, setTempMode] = useState(streamMode);

  // Real-time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync modal form when opening
  const handleOpenSettings = () => {
    const currentParsed = parseStreamUrl(streamUrl);
    setTempIp(cameraIp);
    setTempPort(currentParsed.port);
    setTempPath(currentParsed.path || DEFAULT_PATH);
    setTempMode(streamMode);
    setIsSettingsOpen(true);
  };

  // Reconnect / refresh stream
  const handleReconnect = () => {
    setStreamStatus("connecting");
    setStreamKey(Date.now());
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    const newUrl = buildStreamUrl(tempIp, tempPort, tempPath);
    const cleanIp =
      tempIp.trim().replace(/^https?:\/\//, "").split("/")[0].split(":")[0] ||
      DEFAULT_IP;

    setCameraIp(cleanIp);
    setStreamUrl(newUrl);
    setStreamMode(tempMode);
    setStreamStatus(tempMode === "live" ? "connecting" : "online");
    setStreamKey(Date.now());

    localStorage.setItem("esp32_cam_ip", cleanIp);
    localStorage.setItem("esp32_cam_stream_url", newUrl);
    localStorage.setItem("esp32_cam_mode", tempMode);

    setIsSettingsOpen(false);
  };

  // Reset to default
  const handleResetDefault = () => {
    setTempIp(DEFAULT_IP);
    setTempPort("");
    setTempPath(DEFAULT_PATH);
    setTempMode("live");
  };

  // Apply quick presets
  const applyPreset = (presetIp, presetPort = "", presetPath = "/stream") => {
    setTempIp(presetIp);
    setTempPort(presetPort);
    setTempPath(presetPath);
  };

  const handleTakeSnapshot = () => {
    setIsCapturing(true);

    if (streamMode === "live" && streamStatus === "online") {
      try {
        const captureUrl = `http://${cameraIp}/capture?t=${Date.now()}`;
        const link = document.createElement("a");
        link.href = captureUrl;
        link.download = `esp32_capture_${Date.now()}.jpg`;
        link.target = "_blank";
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.warn("Could not auto-download snapshot:", err);
      }
    }

    setTimeout(() => {
      setIsCapturing(false);
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 3000);
    }, 500);
  };

  const cameras = [
    {
      id: "cam-1",
      name: `CAM 01 — Main Entrance (ESP32-CAM: ${cameraIp})`,
      status: streamStatus === "online" ? "ONLINE" : streamMode === "demo" ? "DEMO" : "OFFLINE",
      fps: 30,
    },
    { id: "cam-2", name: "CAM 02 — Office Turnstile (IP Cam)", status: "ONLINE", fps: 28 },
    { id: "cam-3", name: "CAM 03 — Perimeter Fence (ESP32)", status: "ONLINE", fps: 25 },
  ];

  // Calculated preview URL in modal
  const modalPreviewUrl = buildStreamUrl(tempIp, tempPort, tempPath);

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
            Live Detection & Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b]">
            Real-time YOLOv8 edge inference stream and security telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#e8e0d5] text-xs font-semibold shadow-2xs">
            <Radio className="w-4 h-4 text-[#2e7d32] animate-pulse" />
            <span className="text-[#1a1a1a]">WebSocket Stream: CONNECTED</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Visitors Today"
          value="142"
          subtitle="Unique face sessions"
          icon={Users}
          trend="+18% vs yesterday"
          color="peach"
        />
        <MetricCard
          title="Identified (Known)"
          value="128"
          subtitle="90.1% Recognition rate"
          icon={CheckCircle2}
          trend="+12 known"
          color="green"
        />
        <MetricCard
          title="Unidentified (Unknown)"
          value="12"
          subtitle="Pending database match"
          icon={AlertTriangle}
          trend="8.4% of total"
          color="cyan"
        />
        <MetricCard
          title="Threats / Blacklist"
          value="2"
          subtitle="Critical alerts triggered"
          icon={ShieldAlert}
          trend="Immediate Action"
          color="red"
        />
      </div>

      {/* Main Monitoring Section: Camera Feed + Recent Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Live Stream (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8e0d5] shadow-xs flex flex-col gap-4">
            {/* Camera Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e8e0d5]">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="bg-[#f7f1e9] border border-[#e8e0d5] text-xs font-bold text-[#1a1a1a] rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-[#e8b48a]"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Connection Status Badge */}
                {streamMode === "demo" ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#fff3e0] text-[#e65100] px-2.5 py-1 rounded-md border border-[#ffe0b2]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e65100]" />
                    DEMO MODE
                  </span>
                ) : streamStatus === "online" ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#e8f5e9] text-[#2e7d32] px-2.5 py-1 rounded-md border border-[#a5d6a7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-ping" />
                    ONLINE
                  </span>
                ) : streamStatus === "connecting" ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#e3f2fd] text-[#1565c0] px-2.5 py-1 rounded-md border border-[#bbdefb]">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    CONNECTING...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#ffebee] text-[#c62828] px-2.5 py-1 rounded-md border border-[#ffcdd2]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c62828]" />
                    OFFLINE
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* IP Settings Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenSettings}
                  icon={SlidersHorizontal}
                >
                  <span className="hidden sm:inline">ตั้งค่า IP</span>
                </Button>

                {/* Reconnect / Reload Stream Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReconnect}
                  title="รีเฟรชการเชื่อมต่อสตรีม"
                  icon={RefreshCw}
                >
                  <span className="hidden md:inline">รีเฟรช</span>
                </Button>

                {/* Bounding Box Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBoxes(!showBoxes)}
                  icon={showBoxes ? Eye : EyeOff}
                >
                  <span className="hidden sm:inline">Bounding Boxes</span>
                </Button>

                {/* Snapshot Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTakeSnapshot}
                  disabled={isCapturing}
                  icon={Camera}
                >
                  <span className="hidden sm:inline">
                    {isCapturing ? "Capturing..." : "Snapshot"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Live Video Display Container */}
            <div className="relative rounded-2xl overflow-hidden bg-[#141414] aspect-16/10 flex items-center justify-center select-none group">
              {/* Camera Video Stream Frame */}
              {streamMode === "live" ? (
                <img
                  key={`${streamUrl}-${streamKey}`}
                  src={`${streamUrl}${streamUrl.includes("?") ? "&" : "?"}_t=${streamKey}`}
                  alt="ESP32-CAM Live MJPEG Stream"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    streamStatus === "offline" ? "opacity-15" : "opacity-100"
                  }`}
                  onLoad={() => setStreamStatus("online")}
                  onError={() => setStreamStatus("offline")}
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80"
                  alt="Demo Camera Feed"
                  className="w-full h-full object-cover opacity-90 transition-all duration-300"
                />
              )}

              {/* OFFLINE / CONNECTION ERROR OVERLAY */}
              {streamMode === "live" && streamStatus === "offline" && (
                <div className="absolute inset-0 bg-[#0c0e12]/92 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-2xl bg-[#c62828]/15 border border-[#c62828]/30 flex items-center justify-center mb-3">
                    <WifiOff className="w-7 h-7 text-[#ef5350]" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                    ไม่สามารถเชื่อมต่อกล้อง ESP32-CAM ได้
                  </h3>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-[#f5c9a8] bg-black/60 px-3.5 py-1.5 rounded-lg border border-white/10 mb-3 max-w-full overflow-hidden text-ellipsis">
                    <span>{streamUrl}</span>
                    <a
                      href={streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/60 hover:text-white"
                      title="เปิดในแท็บใหม่"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-white/70 max-w-md mb-5 leading-relaxed">
                    กรุณาตรวจสอบว่า ESP32 เปิดทำงานและเชื่อมต่อ Wi-Fi / Hotspot วงเดียวกัน (IP: {cameraIp})
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={RefreshCw}
                      onClick={handleReconnect}
                    >
                      ลองเชื่อมต่อใหม่ (Retry)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={SlidersHorizontal}
                      onClick={handleOpenSettings}
                    >
                      เปลี่ยน IP กล้อง
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white/30 hover:bg-white/10"
                      onClick={() => {
                        setStreamMode("demo");
                        localStorage.setItem("esp32_cam_mode", "demo");
                      }}
                    >
                      ใช้โหมดจำลอง (Demo Mode)
                    </Button>
                  </div>
                </div>
              )}

              {/* DEMO MODE NOTICE PILL */}
              {streamMode === "demo" && (
                <div className="absolute top-4 inset-x-0 mx-auto w-max bg-[#1a1a1a]/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white text-[11px] font-medium flex items-center gap-2 z-10 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#f5c9a8]" />
                  <span>กำลังแสดงภาพตัวอย่าง (Demo Feed)</span>
                  <button
                    onClick={() => {
                      setStreamMode("live");
                      setStreamStatus("connecting");
                      localStorage.setItem("esp32_cam_mode", "live");
                    }}
                    className="ml-1 text-[#f5c9a8] underline hover:text-white cursor-pointer font-bold"
                  >
                    สลับไปสตรีมสด ESP32
                  </button>
                </div>
              )}

              {/* HUD Overlay - Top Left */}
              <div className="absolute top-4 left-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-3 text-xs font-mono z-10">
                <div className="flex items-center gap-1.5 text-[#c62828] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#c62828] animate-pulse" />
                  <span>REC</span>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                  <Clock className="w-3.5 h-3.5 text-[#f5c9a8]" />
                  <span>{currentTime || "10:42:18"}</span>
                </div>
                <span className="text-[#26a69a] font-semibold">
                  {streamMode === "live" ? "SVGA (800x600)" : "30.2 FPS"}
                </span>
                <span className="text-white/60 hidden sm:inline">
                  {streamMode === "live" ? cameraIp : "SIMULATED"}
                </span>
              </div>

              {/* HUD Overlay - Top Right Status */}
              <div className="absolute top-4 right-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px] font-mono z-10">
                MODEL: <span className="text-[#f5c9a8] font-bold">YOLOv8n-face</span>
              </div>

              {/* Simulated YOLO Face Bounding Box #1 (VIP) */}
              {showBoxes && (
                <div className="absolute top-[20%] left-[34%] w-[32%] h-[46%] border-2 border-[#f5c9a8] rounded-xl shadow-[0_0_20px_rgba(245,201,168,0.7)] flex flex-col justify-between p-2 pointer-events-none transition-all duration-300 animate-in fade-in z-10">
                  <div className="flex items-start justify-between">
                    <span className="bg-[#f5c9a8] text-[#1a1a1a] text-xs font-black px-2 py-0.5 rounded shadow-sm">
                      Dr. Somchai Prasert
                    </span>
                    <span className="bg-[#2e7d32] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      98.4% VIP
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white bg-black/70 px-2 py-1 rounded backdrop-blur-xs">
                    <span>Zone: Main Foyer</span>
                    <span className="text-[#2e7d32]">MATCH OK</span>
                  </div>
                </div>
              )}

              {/* Snapshot Toast notification within view */}
              {snapshotSuccess && (
                <div className="absolute bottom-4 inset-x-6 bg-[#2e7d32] text-white py-2 px-4 rounded-xl text-center text-xs font-bold shadow-lg animate-in fade-in duration-200 z-30">
                  Snapshot captured & saved successfully!
                </div>
              )}
            </div>

            {/* Camera Bottom Telemetry Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b6b6b] pt-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span>
                  Source:{" "}
                  <strong className="text-[#1a1a1a] font-mono">
                    {streamMode === "live" ? streamUrl : "Demo Mock Stream"}
                  </strong>
                </span>
                {streamMode === "live" && (
                  <div className="flex items-center gap-2">
                    <a
                      href={streamUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#e65100] hover:underline font-semibold"
                    >
                      <span>Open Stream</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span>•</span>
                    <a
                      href={`http://${cameraIp}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#2e7d32] hover:underline font-semibold"
                    >
                      <span>ESP32 Web Server</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <span>•</span>
                <span>Codec: MJPEG (OV3660)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenSettings}
                  className="text-xs font-semibold text-[#1a1a1a] hover:text-[#e65100] underline cursor-pointer"
                >
                  ตั้งค่า IP
                </button>
                <span className="font-mono text-[#26a69a]">Latency: ~28ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Visitors Feed (1 Col) */}
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-3xl p-5 border border-[#e8e0d5] shadow-xs flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between border-b border-[#e8e0d5] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#1a1a1a]">
                  Recent Visitors
                </h2>
                <p className="text-xs text-[#6b6b6b]">Live face detection log</p>
              </div>
              <span className="text-xs font-bold bg-[#f7f1e9] text-[#1a1a1a] px-2 py-1 rounded-lg border border-[#e8e0d5]">
                {visitors.length} Logs
              </span>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[460px] pr-1">
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="p-3 rounded-2xl bg-[#f7f1e9]/60 hover:bg-[#f7f1e9] border border-[#e8e0d5] transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={visitor.photoUrl}
                      alt={visitor.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[#e8e0d5] shadow-2xs"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1a1a1a]">
                        {visitor.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b]">
                        <span>{visitor.time}</span>
                        <span>•</span>
                        <span>{visitor.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={visitor.role}>{visitor.role}</Badge>
                    <span className="text-[10px] font-mono text-[#6b6b6b]">
                      {visitor.confidence}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-3 border-t border-[#e8e0d5] text-center">
              <span className="text-xs text-[#6b6b6b]">
                Auto-syncing with ESP32-CAM Node ({cameraIp})...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* IP & CAMERA STREAM CONFIGURATION MODAL */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="ตั้งค่าการเชื่อมต่อกล้อง ESP32-CAM"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
          {/* Quick Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
              ค่าเริ่มต้นแนะนำ (Quick Presets)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset(DEFAULT_IP, "", "/stream")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  tempIp === DEFAULT_IP
                    ? "border-[#e8b48a] bg-[#f5c9a8]/20 font-bold text-[#1a1a1a]"
                    : "border-[#e8e0d5] bg-[#f7f1e9]/60 hover:bg-[#f7f1e9] text-[#4a4a4a]"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold">ESP32 Hotspot (ค่าเริ่มต้น)</span>
                  {tempIp === DEFAULT_IP && (
                    <Check className="w-3.5 h-3.5 text-[#2e7d32]" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#6b6b6b]">
                  192.168.137.112/stream
                </span>
              </button>

              <button
                type="button"
                onClick={() => applyPreset("192.168.4.1", "", "/stream")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  tempIp === "192.168.4.1"
                    ? "border-[#e8b48a] bg-[#f5c9a8]/20 font-bold text-[#1a1a1a]"
                    : "border-[#e8e0d5] bg-[#f7f1e9]/60 hover:bg-[#f7f1e9] text-[#4a4a4a]"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold">ESP32 AP Mode (สำรอง)</span>
                  {tempIp === "192.168.4.1" && (
                    <Check className="w-3.5 h-3.5 text-[#2e7d32]" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#6b6b6b]">
                  192.168.4.1/stream
                </span>
              </button>
            </div>
          </div>

          {/* Form Fields: IP, Port, Stream Path */}
          <div className="flex flex-col gap-3">
            <Input
              label="Camera IP Address หรือ Hostname"
              id="camera-ip-input"
              value={tempIp}
              onChange={(e) => setTempIp(e.target.value)}
              placeholder="e.g. 192.168.137.112"
              icon={Wifi}
              helperText="ใส่ IP ของบอร์ด ESP32 ที่แสดงใน Arduino Serial Monitor"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Port (ค่าเริ่มต้นคือ 80)"
                id="camera-port-input"
                value={tempPort}
                onChange={(e) => setTempPort(e.target.value)}
                placeholder="80"
                type="number"
              />
              <Input
                label="Stream Path"
                id="camera-path-input"
                value={tempPath}
                onChange={(e) => setTempPath(e.target.value)}
                placeholder="/stream"
              />
            </div>
          </div>

          {/* Stream Mode Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
              โหมดการแสดงผล (Stream Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  tempMode === "live"
                    ? "border-[#2e7d32] bg-[#e8f5e9]/60 text-[#1a1a1a]"
                    : "border-[#e8e0d5] hover:bg-[#f7f1e9] text-[#6b6b6b]"
                }`}
              >
                <input
                  type="radio"
                  name="streamMode"
                  value="live"
                  checked={tempMode === "live"}
                  onChange={() => setTempMode("live")}
                  className="accent-[#2e7d32]"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">สตรีมสด (Live MJPEG)</span>
                  <span className="text-[10px] text-[#6b6b6b]">
                    ดึงภาพสดจาก ESP32-CAM
                  </span>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  tempMode === "demo"
                    ? "border-[#e65100] bg-[#fff3e0]/60 text-[#1a1a1a]"
                    : "border-[#e8e0d5] hover:bg-[#f7f1e9] text-[#6b6b6b]"
                }`}
              >
                <input
                  type="radio"
                  name="streamMode"
                  value="demo"
                  checked={tempMode === "demo"}
                  onChange={() => setTempMode("demo")}
                  className="accent-[#e65100]"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">โหมดจำลอง (Demo Feed)</span>
                  <span className="text-[10px] text-[#6b6b6b]">
                    ใช้ภาพจำลองเมื่อไม่มีกล้อง
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Full URL Live Preview Box */}
          <div className="p-3.5 rounded-xl bg-[#f7f1e9] border border-[#e8e0d5] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6b6b6b] uppercase tracking-wider">
                Full Stream URL ที่จะเชื่อมต่อ:
              </span>
              <a
                href={modalPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#e65100] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>ทดสอบเปิดลิงก์</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <code className="text-xs font-mono font-bold text-[#1a1a1a] bg-white px-2.5 py-1.5 rounded-lg border border-[#e8e0d5] break-all select-all">
              {modalPreviewUrl}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e8e0d5] gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleResetDefault}
            >
              คืนค่าเริ่มต้น
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsSettingsOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button variant="primary" size="sm" type="submit">
                บันทึกและเชื่อมต่อ
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
