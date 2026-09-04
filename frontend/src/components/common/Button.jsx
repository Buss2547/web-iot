import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  icon: Icon,
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-2.5",
    icon: "p-2 aspect-square rounded-xl",
  };

  const variantStyles = {
    primary:
      "bg-[#f5c9a8] hover:bg-[#e8b48a] text-[#1a1a1a] shadow-xs active:scale-[0.98]",
    secondary:
      "bg-white hover:bg-[#f7f1e9] text-[#1a1a1a] border border-[#e8e0d5] shadow-xs active:scale-[0.98]",
    outline:
      "border border-[#e8e0d5] text-[#1a1a1a] hover:bg-[#f5c9a8]/30 active:scale-[0.98]",
    danger:
      "bg-[#c62828] hover:bg-[#b71c1c] text-white shadow-xs active:scale-[0.98]",
    ghost:
      "text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#e8e0d5]/40",
    tag:
      "bg-[#f7f1e9] text-[#6b6b6b] hover:text-[#1a1a1a] border border-transparent hover:border-[#e8e0d5] rounded-full",
    tagActive:
      "bg-[#f5c9a8] text-[#1a1a1a] font-semibold shadow-xs border border-[#e8b48a] rounded-full",
  };

  const computedVariant = variantStyles[variant] || variantStyles.primary;
  const computedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${computedSize} ${computedVariant} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}
