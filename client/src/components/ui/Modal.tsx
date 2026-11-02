import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const WIDTHS = { sm: 380, md: 460, lg: 560, xl: 720 };

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  className,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/70" />

      <div
        style={{ maxWidth: WIDTHS[maxWidth] }}
        className={cn(
          "relative z-10 w-full bg-[#141b13] border border-[#233026] rounded-[16px] shadow-2xl flex flex-col overflow-hidden text-[#f1f5f2] font-sans",
          className
        )}
      >
        {(title || description) && (
          <div className="px-[22px] pt-[20px] pb-[14px] border-b border-[#233026] flex items-start justify-between gap-3">
            <div>
              {title && <h3 className="text-[22px] font-medium leading-[30px]">{title}</h3>}
              {description && (
                <p className="text-[16px] text-[#9aa69f] mt-[2px]">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-[6px] rounded-[8px] text-[#9aa69f] hover:text-[#f1f5f2] hover:bg-[#1a231b]"
            >
              <X className="w-[20px] h-[20px]" />
            </button>
          </div>
        )}

        <div className="px-[22px] py-[18px] overflow-y-auto max-h-[70vh]">{children}</div>

        {footer && (
          <div className="px-[22px] py-[14px] border-t border-[#233026] flex items-center justify-end gap-[10px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
