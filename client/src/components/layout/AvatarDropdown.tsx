import React, { useEffect, useRef } from "react";
import { useUIStore } from "../../store/useUIStore";
import { Icons } from "../icons";

interface AvatarDropdownProps {
  onSelectOption?: (optionKey: string) => void;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ onSelectOption }) => {
  const { isAvatarDropdownOpen, setAvatarDropdownOpen, openModal } = useUIStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAvatarDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAvatarDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAvatarDropdownOpen, setAvatarDropdownOpen]);

  if (!isAvatarDropdownOpen) return null;

  const handleAction = (key: string) => {
    setAvatarDropdownOpen(false);
    onSelectOption?.(key);

    if (key === "billing") {
      openModal("SUBSCRIPTION_BILLING");
    } else if (key === "branding") {
      openModal("BRANDING_LOGO_UPLOAD");
    } else if (key === "profile") {
      openModal("STORE_PROFILE_SETTINGS");
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-14 z-50 w-72 bg-[#111C15] border border-[#213328] rounded-[16px] shadow-2xl p-2 flex flex-col gap-1 text-[#E8F3EB] font-sans animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Merchant Header Details */}
      <div className="px-3.5 py-3 border-b border-[#213328] mb-1 bg-[#0C1610] rounded-[12px]">
        <div className="text-sm font-bold text-[#E8F3EB] leading-tight">Mudnaan Shop</div>
        <div className="text-xs text-[#8FA396] font-mono mt-0.5">mudnaan@emudnaan.com</div>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[9px] bg-[#1fbf55]/10 text-[#1fbf55] text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1fbf55]" />
          Verified Merchant
        </div>
      </div>

      {/* Menu Options */}
      <button
        onClick={() => handleAction("profile")}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold text-[#E8F3EB] hover:bg-[#16241B] transition-colors text-left"
      >
        <Icons.Settings className="w-4 h-4 text-[#8FA396]" />
        <span>Store Profile & Settings</span>
      </button>

      <button
        onClick={() => handleAction("branding")}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold text-[#E8F3EB] hover:bg-[#16241B] transition-colors text-left"
      >
        <Icons.Image className="w-4 h-4 text-[#8FA396]" />
        <span>Company Branding & Logo Upload</span>
      </button>

      <button
        onClick={() => handleAction("billing")}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold text-[#E8F3EB] hover:bg-[#16241B] transition-colors text-left"
      >
        <Icons.CreditCard className="w-4 h-4 text-[#8FA396]" />
        <span>Billing & Subscriptions</span>
      </button>

      <button
        onClick={() => handleAction("support")}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold text-[#E8F3EB] hover:bg-[#16241B] transition-colors text-left"
      >
        <Icons.LifeBuoy className="w-4 h-4 text-[#8FA396]" />
        <span>Merchant Support</span>
      </button>

      <div className="my-1 border-t border-[#213328]" />

      <button
        onClick={() => handleAction("signout")}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold text-[#f87171] hover:bg-[#2b1212] transition-colors text-left"
      >
        <Icons.LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default AvatarDropdown;
