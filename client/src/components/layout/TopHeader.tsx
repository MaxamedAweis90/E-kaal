import React, { useRef, useEffect } from "react";
import { useUIStore } from "../../store/useUIStore";
import { useAppStore } from "../../store/useAppStore";
import { Icons, CalcMathIcon } from "../icons";
import { AvatarDropdown } from "./AvatarDropdown";

interface TopHeaderProps {
  subscriptionRemainingDays?: number;
  subscriptionTier?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  subscriptionRemainingDays = 28,
  subscriptionTier = "1 Month",
}) => {
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    toggleCalculator,
    toggleAvatarDropdown,
  } = useUIStore();

  const { toggleMobileMenu } = useAppStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        toggleCalculator();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCalculator]);

  return (
    <header className="h-[68px] bg-[#0b120a] border-b border-[#233026] px-6 flex items-center justify-between shrink-0 gap-4 font-sans select-none z-20 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-[#161a19] border border-[#233026] text-[#9aa69f]"
        >
          <Icons.Menu className="w-5 h-5" />
        </button>

        {/* Search: 332 x 41 */}
        <div className="relative w-[332px] max-w-[40vw]">
          <Icons.Search
            className="w-[19px] h-[19px] text-[#7d8a82] absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.6}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full h-[41px] pl-[44px] pr-4 bg-[#161a19] rounded-[10px] text-[16px] text-[#f1f5f2] placeholder:text-[#7d8a82] focus:outline-none focus:ring-1 focus:ring-[#54a376] border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-[16px] shrink-0">
        {/* Calculator 44 x 44 */}
        <button
          onClick={toggleCalculator}
          className="w-[44px] h-[44px] rounded-[10px] bg-[#1a201a] border border-[#2e3a31] flex items-center justify-center text-[#b6c0b9] hover:bg-[#222a22] transition-colors"
          title="Calculator [Alt+C]"
        >
          <CalcMathIcon className="w-[22px] h-[22px]" />
        </button>

        {/* Subscription pill 207 x 40 */}
        <div className="h-[40px] px-[18px] bg-[#2c8e5f] text-white text-[16px] font-normal rounded-full flex items-center whitespace-nowrap">
          {subscriptionTier} &nbsp;•&nbsp; {subscriptionRemainingDays} days left
        </div>

        {/* Bell 42 x 42 */}
        <button
          className="w-[42px] h-[42px] rounded-[10px] bg-[#141a14] flex items-center justify-center relative text-[#b6c0b9] transition-colors"
          title="Notifications"
        >
          <Icons.Bell className="w-[20px] h-[20px]" strokeWidth={1.6} />
          <span className="absolute top-[3px] right-[3px] w-[16px] h-[16px] bg-[#e0494f] text-white text-[10px] font-medium rounded-full flex items-center justify-center leading-none">
            1
          </span>
        </button>

        {/* Avatar 40 x 40 */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleAvatarDropdown();
            }}
            className="w-[40px] h-[40px] rounded-full bg-[#a7b2aa] flex items-center justify-center text-[#4f5d54] focus:outline-none relative"
            title="Profile & Settings"
          >
            <Icons.User className="w-[22px] h-[22px]" fill="currentColor" strokeWidth={1} />
            <span className="absolute -top-[2px] -right-[2px] w-[10px] h-[10px] rounded-full bg-[#3fbf68] border-2 border-[#0b120a]" />
          </button>

          <AvatarDropdown />
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
