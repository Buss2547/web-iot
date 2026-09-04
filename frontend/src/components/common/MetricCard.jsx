import React from "react";

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "peach",
  className = "",
}) {
  const accentColors = {
    peach: "bg-[#f5c9a8]/30 text-[#1a1a1a] border-[#e8b48a]/50",
    green: "bg-[#e8f5e9] text-[#2e7d32] border-[#a5d6a7]",
    red: "bg-[#ffebee] text-[#c62828] border-[#ffcdd2]",
    cyan: "bg-[#e0f2f1] text-[#26a69a] border-[#80cbc4]",
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-[#e8e0d5] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6b6b6b]">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              accentColors[color] || accentColors.peach
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.startsWith("+") || trend.includes("up")
                ? "bg-[#e8f5e9] text-[#2e7d32]"
                : "bg-[#ffebee] text-[#c62828]"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-[#6b6b6b]">{subtitle}</div>
      )}
    </div>
  );
}
