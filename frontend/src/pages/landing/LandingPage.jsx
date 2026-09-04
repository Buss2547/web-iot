import React from "react";
import { Link } from "react-router";
import {
  Camera,
  Cpu,
  Bell,
  ArrowRight,
  CheckCircle2,
  Activity,
} from "lucide-react";
import Button from "../../components/common/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 pt-4">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/3 w-80 h-80 bg-[#f5c9a8]/50 rounded-full blur-3xl -z-10" />

        <div className="flex-1 flex flex-col gap-6 max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 self-center lg:self-start px-3.5 py-1.5 rounded-full bg-white border border-[#e8e0d5] text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#26a69a]" />
            <span>Vigil AI Smart Security System 2026</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight leading-[1.1]">
            Next-Gen Face Recognition for{" "}
            <span className="bg-gradient-to-r from-[#e8b48a] to-[#d89260] bg-clip-text text-transparent underline decoration-[#f5c9a8] decoration-wavy decoration-2">
              Smart IoT
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6b6b6b] leading-relaxed">
            Protect facilities, offices, and smart homes with real-time YOLOv8
            face detection and ESP32-CAM edge telemetry. Instant visitor
            classification and proactive intrusion alerts.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <Link to="/detection">
              <Button size="lg" className="shadow-md text-base">
                <span>Open Live Detection</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            <Link to="/training">
              <Button variant="secondary" size="lg" className="text-base">
                Explore Database & AI
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-medium text-[#6b6b6b]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
              <span>99.4% Accuracy (ArcFace)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
              <span>ESP32-CAM & RTSP Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2e7d32]" />
              <span>&lt; 35ms Inference Latency</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Camera Teaser */}
        <div className="flex-1 w-full max-w-lg relative">
          <div className="relative bg-white rounded-3xl p-4 border border-[#e8e0d5] shadow-xl overflow-hidden">
            {/* Top Bar on Mockup */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e0d5]/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c62828] animate-pulse" />
                <span className="font-bold text-[#1a1a1a]">CAM 01 — MAIN ENTRANCE</span>
              </div>
              <span className="font-mono text-[#2e7d32] bg-[#e8f5e9] px-2 py-0.5 rounded-md font-semibold">
                LIVE 30 FPS
              </span>
            </div>

            {/* Mock Camera View */}
            <div className="mt-3 relative rounded-2xl overflow-hidden bg-neutral-900 aspect-4/3 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                alt="Detection Demo"
                className="w-full h-full object-cover opacity-85"
              />

              {/* Bounding Box Overlay */}
              <div className="absolute top-[22%] left-[34%] w-[32%] h-[42%] border-2 border-[#f5c9a8] rounded-xl shadow-[0_0_15px_rgba(245,201,168,0.6)] flex flex-col justify-between p-1.5 pointer-events-none">
                <div className="flex items-center justify-between">
                  <span className="bg-[#f5c9a8] text-[#1a1a1a] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    VIP 98.4%
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                </div>
                <div className="text-[9px] font-mono text-white bg-black/70 px-1 py-0.5 rounded backdrop-blur-xs">
                  Dr. Somchai P.
                </div>
              </div>

              {/* Floating Bottom HUD */}
              <div className="absolute bottom-3 inset-x-3 bg-black/60 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between text-white text-[11px]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#f5c9a8]" />
                  <span>Face Vector: 512D ArcFace</span>
                </div>
                <span className="font-mono text-[#26a69a]">Status: AUTHORIZED</span>
              </div>
            </div>

            {/* Mini Footer Under Mockup */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#f7f1e9] p-2 rounded-xl border border-[#e8e0d5]">
                <div className="text-[10px] text-[#6b6b6b]">Today Visitors</div>
                <div className="text-sm font-bold text-[#1a1a1a]">142</div>
              </div>
              <div className="bg-[#e8f5e9] p-2 rounded-xl border border-[#c8e6c9]">
                <div className="text-[10px] text-[#2e7d32]">Identified</div>
                <div className="text-sm font-bold text-[#2e7d32]">128</div>
              </div>
              <div className="bg-[#ffebee] p-2 rounded-xl border border-[#ffcdd2]">
                <div className="text-[10px] text-[#c62828]">Threats Blocked</div>
                <div className="text-sm font-bold text-[#c62828]">2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
            Engineered for High-Security Environments
          </h2>
          <p className="text-sm text-[#6b6b6b]">
            From low-power microcontrollers to edge GPU clusters, Vigil covers
            the full computer vision and security pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e0d5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#f5c9a8]/40 border border-[#e8b48a]/60 flex items-center justify-center text-[#1a1a1a]">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                YOLOv8 + ArcFace Pipeline
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                State-of-the-art bounding box inference combined with 512-dimension
                ArcFace feature vectors for invariant identification under varying
                lighting conditions and angles.
              </p>
            </div>
            <Link
              to="/training"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e8b48a] hover:text-[#d89260]"
            >
              <span>View Training Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e0d5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e0f2f1] border border-[#80cbc4] flex items-center justify-center text-[#26a69a]">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                ESP32-CAM & Edge Hardware
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Optimized for ultra-low cost microcontrollers like ESP32-CAM via
                MJPEG / WebRTC stream, with WebSocket telemetry sending real-time
                bounding box coordinates.
              </p>
            </div>
            <Link
              to="/detection"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#26a69a] hover:underline"
            >
              <span>Launch Live Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8e0d5] shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ffebee] border border-[#ffcdd2] flex items-center justify-center text-[#c62828]">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
                Real-Time Blacklist Defense
              </h3>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Automatic instant categorization for Employees, Visitors, VIPs,
                and immediate CRITICAL alerts when a blacklisted subject is
                spotted on any camera node.
              </p>
            </div>
            <Link
              to="/alerts"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c62828] hover:underline"
            >
              <span>Inspect Security Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="bg-gradient-to-r from-[#f5c9a8] via-[#eed1be] to-[#f5c9a8] rounded-3xl p-8 sm:p-12 border border-[#e8b48a] shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-black text-[#1a1a1a]">
            Ready to Deploy Face Recognition?
          </h3>
          <p className="text-xs sm:text-sm text-[#1a1a1a]/80 max-w-lg">
            Register new subjects, upload your face dataset, or connect your
            ESP32-CAM module in minutes.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/add-person">
            <Button size="lg" className="bg-[#1a1a1a] text-white hover:bg-neutral-800">
              Register New Person
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
