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
    } else if (key === "branding") {
      openModal("BRANDING_LOGO_UPLOAD");
    } else if (key === "billing") {
      openModal("SUBSCRIPTION_BILLING");
    } else if (key === "support") {
      openModal("MERCHANT_SUPPORT");
    }
  };

  const profile = merchant.data;

  const itemClass =
    "w-full h-[38px] flex items-center gap-2.5 px-3 rounded-badge text-sm font-normal transition-colors text-left border whitespace-nowrap";

  return (
    <div
      ref={dropdownRef}
      role="menu"
      aria-label="Account and store settings"
      className="absolute right-0 top-[50px] z-50 w-80 bg-surface border border-border rounded-btn p-1.5 flex flex-col gap-0.5 text-text font-sans shadow-xl"
    >
      {profile && (
        <div className="px-3 py-2.5 mb-1 border-b border-border">
          <div className="text-sm font-medium text-text leading-tight truncate">
            {profile.shopName}
          </div>
          {(profile.email || profile.phone) && (
            <div className="text-xs text-muted mt-0.5 truncate">
              {profile.email || profile.phone}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction("settings")}
        className={cn(
          itemClass,
          activeModule === "settings"
            ? "bg-primary-soft border-border text-text"
            : "border-transparent text-text-2 hover:text-text hover:bg-surface-2"
        )}
      >
        <Icons.Settings
          className={cn(
            "w-[18px] h-[18px] shrink-0",
            activeModule === "settings" ? "text-primary" : "text-muted"
          )}
          strokeWidth={1.6}
        />
        <span>Store Profile & Settings</span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction("branding")}
        className={cn(
          itemClass,
          "border-transparent text-text-2 hover:text-text hover:bg-surface-2"
        )}
      >
        <Icons.Image className="w-[18px] h-[18px] text-muted shrink-0" strokeWidth={1.6} />
        <span>Company Branding & Logo Upload</span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction("billing")}
        className={cn(
          itemClass,
          "border-transparent text-text-2 hover:text-text hover:bg-surface-2"
        )}
      >
        <Icons.CreditCard className="w-[18px] h-[18px] text-muted shrink-0" strokeWidth={1.6} />
        <span>Billing & Subscriptions</span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction("support")}
        className={cn(
          itemClass,
          "border-transparent text-text-2 hover:text-text hover:bg-surface-2"
        )}
      >
        <Icons.LifeBuoy className="w-[18px] h-[18px] text-muted shrink-0" strokeWidth={1.6} />
        <span>Support</span>
      </button>

      <div className="my-1 border-t border-border" />

      <button
        type="button"
        role="menuitem"
        onClick={() => handleAction("signout")}
        className={cn(
          itemClass,
          "border-transparent text-out hover:bg-[#241616]"
        )}
      >
        <Icons.LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.6} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default AvatarDropdown;
