import React from "react";

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = "",
  id,
  type = "text",
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#6b6b6b] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full bg-white border border-[#e8e0d5] text-[#1a1a1a] text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-[#6b6b6b]/60 focus:border-[#e8b48a] focus:ring-2 focus:ring-[#f5c9a8]/30 ${
            Icon ? "pl-10" : ""
          } ${error ? "border-[#c62828] focus:border-[#c62828] focus:ring-[#c62828]/20" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#c62828] font-medium">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-[#6b6b6b]">{helperText}</span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  id,
  rows = 3,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full bg-white border border-[#e8e0d5] text-[#1a1a1a] text-sm rounded-xl p-3.5 outline-none transition-all placeholder:text-[#6b6b6b]/60 focus:border-[#e8b48a] focus:ring-2 focus:ring-[#f5c9a8]/30 ${
          error ? "border-[#c62828]" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#c62828] font-medium">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-[#6b6b6b]">{helperText}</span>
      )}
    </div>
  );
}

export default Input;
