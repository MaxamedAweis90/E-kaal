import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MoreHorizontal, Plus, Search } from "lucide-react";
import { cn } from "../../utils/cn";

/* Shared building blocks measured from plan/screens/*.jpg */

export const PANEL = "bg-[#141b13] border border-[#233026] rounded-[16px]";
export const HEAD_TEXT = "text-[18px] text-[#cfd6d1] font-normal";

/* ---------- Page header ---------- */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  /** Header lives inside its own bordered panel (Deymaha). */
  boxed?: boolean;
  /** Space under the header (px). */
  gapAfter?: number;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  filters,
  boxed,
  gapAfter,
}) => (
  <div
    style={{ marginBottom: gapAfter ?? (boxed ? 16 : filters ? 17 : 22) }}
    className={cn(
      "shrink-0 flex items-start justify-between gap-3",
      boxed && `${PANEL} h-[112px] px-[19px] overflow-hidden`
    )}
  >
    <div className={boxed ? "pt-[16px]" : ""}>
      <h1 className="text-[30px] font-semibold leading-[40px] text-[#f1f5f2] whitespace-nowrap">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[18px] leading-[26px] mt-[1px] text-[#9aa69f] whitespace-nowrap">
          {subtitle}
        </p>
      )}
    </div>

    {(actions || filters) && (
      <div className={cn("flex flex-col items-end", boxed ? "pt-[15px]" : "pt-[4px]")}>
        {actions && <div className="flex items-center gap-[12px]">{actions}</div>}
        {filters && (
          <div className={cn("flex items-center gap-[10px]", boxed ? "mt-[10px]" : "mt-[19px]")}>
            {filters}
          </div>
        )}
      </div>
    )}
  </div>
);

/* ---------- Controls ---------- */
export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: boolean; h?: number }
> = ({ children, icon = true, h = 44, className, ...rest }) => (
  <button
    style={{ height: h }}
    className={cn(
      "px-[18px] inline-flex items-center justify-center gap-[10px] rounded-[10px] bg-[#2e9e6b] hover:bg-[#38ae78] text-white text-[18px] whitespace-nowrap transition-colors disabled:opacity-50",
      className
    )}
    {...rest}
  >
    {icon && <Plus className="w-[20px] h-[20px]" strokeWidth={1.8} />}
    {children}
  </button>
);

export const SearchBox: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  width: number;
  h?: number;
  iconRight?: boolean;
}> = ({ value, onChange, placeholder, width, h = 44, iconRight = true }) => (
  <div className="relative shrink-0" style={{ width }}>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ height: h }}
      className={cn(
        "w-full bg-[#161a19] border border-[#233026] rounded-[10px] text-[16px] text-[#f1f5f2] placeholder:text-[#6c7c72] focus:outline-none focus:border-[#2e5a40]",
        iconRight ? "pl-[14px] pr-[42px]" : "pl-[42px] pr-[14px]"
      )}
    />
    <Search
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-[19px] h-[19px] text-[#8a978f] pointer-events-none",
        iconRight ? "right-[14px]" : "left-[14px]"
      )}
      strokeWidth={1.6}
    />
  </div>
);

export const SelectBox: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width: number;
  h?: number;
}> = ({ value, onChange, options, width, h = 40 }) => {
  const compact = h <= 34;
  return (
    <div className="relative shrink-0" style={{ width }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ height: h }}
        className={cn(
          "w-full appearance-none bg-[#141b13] border border-[#2c3a31] rounded-[9px] text-[#f1f5f2] focus:outline-none cursor-pointer",
          compact ? "pl-[12px] pr-[30px] text-[16px]" : "pl-[14px] pr-[34px] text-[18px]"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#141b13]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-[#b6c0b9] pointer-events-none",
          compact ? "right-[9px] w-[16px] h-[16px]" : "right-[10px] w-[18px] h-[18px]"
        )}
      />
    </div>
  );
};

export const RowButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "default" | "danger" | "success" }
> = ({ tone = "default", className, children, disabled, ...rest }) => (
  <button
    disabled={disabled}
    className={cn(
      "h-[36px] px-[12px] rounded-[8px] border text-[16px] leading-none whitespace-nowrap transition-colors",
      disabled
        ? "border-[#222c25] text-[#4a554e] cursor-not-allowed"
        : tone === "danger"
        ? "border-[#7a3434] text-[#e0605f] hover:bg-[#2a1717]"
        : tone === "success"
        ? "border-[#2f6d4a] text-[#54a376] hover:bg-[#15281c]"
        : "border-[#2c3a31] text-[#f1f5f2] hover:bg-[#1a231b]",
      className
    )}
    {...rest}
  >
    {children}
  </button>
);

/** Dropdown opened from `Action ⋯` / `⋯` buttons. */
export const RowMenu: React.FC<{
  label?: string;
  plain?: boolean;
  items: { label: string; onClick: () => void; danger?: boolean }[];
}> = ({ label, plain, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {plain ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-[28px] h-[34px] inline-flex items-center justify-center rounded-[8px] text-[#9aa69f] hover:text-[#f1f5f2] hover:bg-[#1a231b] transition-colors shrink-0"
        >
          <MoreHorizontal className="w-[18px] h-[18px]" />
        </button>
      ) : (
        <RowButton
          onClick={() => setOpen((o) => !o)}
          className={cn("inline-flex items-center justify-center gap-[8px]", !label && "w-[37px] px-0")}
        >
          {label && <span>{label}</span>}
          <MoreHorizontal className="w-[18px] h-[18px] text-[#b6c0b9]" />
        </RowButton>
      )}
      {open && (
        <div className="absolute right-0 top-[40px] z-30 min-w-[170px] bg-[#141b13] border border-[#2c3a31] rounded-[10px] py-[6px] shadow-xl">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
              className={cn(
                "w-full text-left px-[14px] py-[8px] text-[17px] hover:bg-[#1a231b]",
                it.danger ? "text-[#e0605f]" : "text-[#f1f5f2]"
              )}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const StatusPill: React.FC<{
  tone: "owing" | "settled" | "completed" | "pending" | "failed";
  compact?: boolean;
  children: React.ReactNode;
}> = ({ tone, compact, children }) => (
  <span
    className={cn(
      "inline-flex items-center h-[32px] rounded-full leading-none whitespace-nowrap",
      compact ? "px-[12px] text-[16px]" : "px-[14px] text-[17px]",
      tone === "owing" && "bg-[#3a1d1d] text-[#e0605f]",
      tone === "settled" && "bg-[#16301f] text-[#54a376]",
      tone === "completed" && "border border-[#2f6d4a] text-[#54a376]",
      tone === "pending" && "border border-[#6b5a2a] text-[#e8a23a]",
      tone === "failed" && "border border-[#7a3434] text-[#e0605f]"
    )}
  >
    {children}
  </span>
);

export const Avatar: React.FC<{
  children: React.ReactNode;
  size?: number;
  square?: boolean;
  muted?: boolean;
}> = ({ children, size = 42, square, muted }) => (
  <span
    style={{ width: size, height: size }}
    className={cn(
      "shrink-0 inline-flex items-center justify-center",
      square ? "rounded-[10px]" : "rounded-full",
      muted ? "bg-[#2a302b] text-[#b6c0b9]" : "bg-[#1f3a28] text-[#54a376]"
    )}
  >
    {children}
  </span>
);

export const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; size?: number }> = ({
  checked,
  onChange,
  size = 24,
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    style={{ width: size, height: size }}
    className={cn(
      "shrink-0 rounded-[6px] border flex items-center justify-center transition-colors",
      checked ? "bg-[#1faa5a] border-[#1faa5a] text-white" : "border-[#3a4a3f] text-transparent"
    )}
  >
    <Check className="w-[16px] h-[16px]" strokeWidth={3} />
  </button>
);

export const StatCard: React.FC<{
  label: string;
  value: string;
  tone?: "white" | "red" | "green";
  className?: string;
}> = ({ label, value, tone = "white", className }) => (
  <div className={cn(`${PANEL} rounded-[14px] px-[23px] pt-[16px] pb-[14px] h-[106px]`, className)}>
    <div className="text-[20px] leading-[28px] text-[#cfd6d1]">{label}</div>
    <div
      className={cn(
        "text-[30px] font-medium leading-[40px]",
        tone === "red" ? "text-[#e0605f]" : tone === "green" ? "text-[#54a376]" : "text-[#f1f5f2]"
      )}
    >
      {value}
    </div>
  </div>
);

export const EmptyLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-[40px] text-center text-[17px] text-[#6c7c72]">{children}</div>
);

/* ---------- Form fields (dialogs + Reseller form) ---------- */
export const inputClass =
  "w-full h-[42px] px-[14px] rounded-[9px] bg-[#101610] border border-[#2c3a31] text-[18px] text-[#f1f5f2] placeholder:text-[#6c7c72] focus:outline-none focus:border-[#2e5a40]";

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-[18px] leading-[24px] text-[#cfd6d1] mb-[5px]">{label}</span>
    {children}
  </label>
);

