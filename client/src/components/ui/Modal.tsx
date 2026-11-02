import React, { useEffect } from "react";
import { Icons } from "../icons";
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#000100]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative z-10 w-full bg-[#111C15] border border-[#213328] rounded-[16px] shadow-2xl flex flex-col overflow-hidden text-[#E8F3EB] font-sans animate-in fade-in zoom-in-95 duration-150",
          maxWidths[maxWidth],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="p-4 border-b border-[#213328] flex items-start justify-between gap-3">
            <div>
              {title && <h3 className="text-sm font-bold text-[#E8F3EB]">{title}</h3>}
              {description && (
                <p className="text-xs text-[#8FA396] mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#16241B] rounded-[9px] text-[#8FA396] hover:text-[#E8F3EB] transition-colors"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[75vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-3 border-t border-[#213328] bg-[#0C1610] flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
