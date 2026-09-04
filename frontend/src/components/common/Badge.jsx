import React from "react";

export default function Badge({ children, variant = "default", className = "", size = "md" }) {
  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const variantClasses = {
    default: "bg-[#f7f1e9] text-[#6b6b6b] border border-[#e8e0d5]",
    known: "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] font-semibold",
    unknown: "bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] font-semibold",
    threat: "bg-[#c62828] text-white border border-[#b71c1c] font-semibold animate-pulse",
    
    // Roles
    employee: "bg-[#e0f2f1] text-[#26a69a] border border-[#80cbc4] font-medium",
    family: "bg-[#fff8e1] text-[#f57f17] border border-[#ffe082] font-medium",
    vip: "bg-[#ede7f6] text-[#673ab7] border border-[#d1c4e9] font-semibold",
    visitor: "bg-[#e3f2fd] text-[#1976d2] border border-[#bbdefb] font-medium",
    blacklist: "bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] font-bold",

    // Alerts
    critical: "bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] font-bold",
    high: "bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2] font-semibold",
    normal: "bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] font-medium",
  };

  const key = String(variant).toLowerCase();
  const activeClass = variantClasses[key] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide uppercase ${sizeClasses[size] || sizeClasses.md} ${activeClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shrink-0" />
      {children}
    </span>
  );
}
