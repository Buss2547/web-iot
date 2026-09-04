import React from "react";
import { Outlet, Link } from "react-router";
import { Shield, ArrowLeft } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f7f1e9] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Glow elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#f5c9a8]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#e8b48a]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Link */}
      <div className="mb-6 z-10 flex flex-col items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-[#f5c9a8] flex items-center justify-center text-[#1a1a1a] shadow-md group-hover:bg-[#e8b48a] transition-all">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-wider text-[#1a1a1a]">
            VIGIL
          </span>
        </Link>
        <span className="text-xs text-[#6b6b6b] mt-1 font-medium">
          Smart Security & IoT Face Recognition
        </span>
      </div>

      {/* Card Body */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-[#e8e0d5] shadow-lg z-10">
        <Outlet />
      </div>

      {/* Back to Home Link */}
      <div className="mt-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
