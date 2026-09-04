import React from "react";
import { Shield, Cpu, Wifi } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#e8e0d5] bg-white/50 backdrop-blur-xs py-8 px-4 text-xs text-[#6b6b6b]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#e8b48a]" />
          <span className="font-bold text-[#1a1a1a]">Vigil Security</span>
          <span>—</span>
          <span>IoT Face Recognition System & YOLOv8 Pipeline</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#26a69a]" />
            YOLOv8n-face
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-[#2e7d32]" />
            ESP32-CAM Mesh
          </span>
          <span>v2.4.0</span>
        </div>
      </div>
    </footer>
  );
}
