import React, { useEffect, useRef } from "react";
import { useUIStore } from "../../store/useUIStore";
import { useAppStore } from "../../store/useAppStore";
import { useMerchantProfile } from "../../hooks/useLedgers";
import { Icons } from "../icons";
import { cn } from "../../utils/cn";

interface AvatarDropdownProps {
  onSelectOption?: (optionKey: string) => void;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ onSelectOption }) => {
  const { isAvatarDropdownOpen, setAvatarDropdownOpen, openModal } = useUIStore();
  const { activeModule, setActiveModule } = useAppStore();
  const merchant = useMerchantProfile();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAvatarDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-avatar-trigger]")) return;
      if (dropdownRef.current && !dropdownRef.current.contains(target as Node)) {
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

    if (key === "settings") {
      setActiveModule("settings");
    } else if (key === "billing") {
      openModal("SUBSCRIPTION_BILLING");
    } else if (key === "branding") {
      openModal("BRANDING_LOGO_UPLOAD");
    }
  };

  const profile = merchant.data;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-[50px] z-50 w-[240px] bg-[#141b13] border border-[#233026] rounded-[12px] p-[6px] flex flex-col gap-[2px] text-[#f1f5f2] font-sans shadow-xl"
    >
      {profile && (
        <div className="px-[12px] py-[10px] mb-[4px] border-b border-[#233026]">
          <div className="text-[15px] font-medium text-[#f1f5f2] leading-tight truncate">
            {profile.shopName}
          </div>
          {(profile.email || profile.phone) && (
            <div className="text-[13px] text-[#9aa69f] mt-[2px] truncate">
              {profile.email || profile.phone}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => handleAction("settings")}
        className={cn(
          "w-full h-[38px] flex items-center gap-[10px] px-[12px] rounded-[8px] text-[15px] font-normal transition-colors text-left border",
          activeModule === "settings"
            ? "bg-[#172319] border-[#2e3e33] text-[#f1f5f2]"
            : "border-transparent text-[#d7dfd9] hover:text-[#f1f5f2] hover:bg-[#192319]"
        )}
      >
        <Icons.Settings className="w-[18px] h-[18px] text-[#9aa69f] shrink-0" strokeWidth={1.6} />
        <span>Settings</span>
      </button>

      <button
        onClick={() => handleAction("billing")}
        className="w-full h-[38px] flex items-center gap-[10px] px-[12px] rounded-[8px] text-[15px] font-normal text-[#d7dfd9] hover:text-[#f1f5f2] hover:bg-[#192319] transition-colors text-left"
      >
        <Icons.CreditCard className="w-[18px] h-[18px] text-[#9aa69f] shrink-0" strokeWidth={1.6} />
        <span>Billing & Subscriptions</span>
      </button>

      <button
        onClick={() => handleAction("support")}
        className="w-full h-[38px] flex items-center gap-[10px] px-[12px] rounded-[8px] text-[15px] font-normal text-[#d7dfd9] hover:text-[#f1f5f2] hover:bg-[#192319] transition-colors text-left"
      >
        <Icons.LifeBuoy className="w-[18px] h-[18px] text-[#9aa69f] shrink-0" strokeWidth={1.6} />
        <span>Support</span>
      </button>

      <div className="my-[4px] border-t border-[#233026]" />

      <button
        onClick={() => handleAction("signout")}
        className="w-full h-[38px] flex items-center gap-[10px] px-[12px] rounded-[8px] text-[15px] font-normal text-[#e0605f] hover:bg-[#241616] transition-colors text-left"
      >
        <Icons.LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.6} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default AvatarDropdown;
