import React, { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-xl border border-[#e8e0d5] overflow-hidden z-10 animate-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e0d5]">
          <h3 className="text-base font-bold text-[#1a1a1a]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-[#f7f1e9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
