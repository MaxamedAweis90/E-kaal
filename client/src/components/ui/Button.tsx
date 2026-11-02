import React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans transition-colors focus:outline-none select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#1fbf55] text-[#000100] hover:bg-[#199d45] font-bold shadow-sm",
      secondary:
        "bg-[#111C15] text-[#E8F3EB] border border-[#213328] hover:bg-[#16241B] font-semibold",
      ghost:
        "bg-transparent text-[#E8F3EB] hover:bg-[#111C15] hover:text-[#1fbf55] font-medium",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs font-semibold rounded-[9px] gap-1.5",
      md: "h-10 px-4 text-sm font-semibold rounded-[10px] gap-2",
      lg: "h-12 px-6 text-base font-bold rounded-[12px] gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
