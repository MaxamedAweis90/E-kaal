import React, { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

export interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
}

export const Popover: React.FC<PopoverProps> = ({
  isOpen,
  onClose,
  children,
  className,
  position = "top-right",
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positions = {
    "top-right": "fixed top-16 right-6",
    "top-left": "fixed top-16 left-6",
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    center: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <div
      ref={popoverRef}
      className={cn(
        "z-50 bg-[#111C15] border border-[#213328] rounded-[16px] shadow-2xl p-4 text-[#E8F3EB] font-sans backdrop-blur-md animate-in fade-in zoom-in-95 duration-100",
        positions[position],
        className
      )}
    >
      {children}
    </div>
  );
};
