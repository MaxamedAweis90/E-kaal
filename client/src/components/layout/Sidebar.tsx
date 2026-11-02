import React from "react";
import { useAppStore, NavigationModule } from "../../store/useAppStore";
import { Icons, WalletLogo } from "../icons";
import { cn } from "../../utils/cn";

interface NavItem {
  id: NavigationModule;
  label: string;
  icon: keyof typeof Icons;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "Dashboard" },
  { id: "deymaha", label: "Deymaha", icon: "Deymaha" },
  { id: "vendor", label: "Vendor", icon: "Vendor" },
  { id: "products", label: "Products", icon: "Products" },
  { id: "reseller", label: "Reseller", icon: "Reseller" },
  { id: "dir-ogeysiis", label: "Dir Ogeysiis", icon: "Broadcast" },
  { id: "reports", label: "Reports", icon: "Reports" },
  { id: "settings", label: "Settings", icon: "Settings" },
];

export const SidebarContent: React.FC = () => {
  const { activeModule, setActiveModule, setMobileMenuOpen } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-[#0b120a] text-[#f1f5f2] select-none font-sans">
      {/* Brand: 68px tall to align with the top bar */}
      <div className="h-[68px] px-6 mb-[14px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <WalletLogo className="w-[42px] h-[42px] text-[#54a376] shrink-0" />
          <div>
            <div className="text-[27px] font-semibold tracking-tight text-[#f1f5f2] leading-[1]">
              E-kaal
            </div>
            <div className="text-[8.5px] font-medium tracking-[0.6px] text-[#8a978f] uppercase mt-[3px] leading-none">
              Merchant System
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-[#141b13] text-[#9aa69f]"
        >
          <Icons.Close className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-[14px] flex flex-col gap-[10px] overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = Icons[item.icon];
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "w-full h-[42px] shrink-0 flex items-center gap-[14px] px-[14px] rounded-[10px] text-[17px] font-normal transition-colors text-left border",
                isActive
                  ? "bg-[#172319] border-[#2e3e33] text-[#f1f5f2]"
                  : "border-transparent text-[#9aa69f] hover:text-[#f1f5f2] hover:bg-[#101810]"
              )}
            >
              <Icon className="w-[22px] h-[22px] shrink-0" strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const { isMobileMenuOpen, setMobileMenuOpen } = useAppStore();

  return (
    <>
      <aside className="hidden lg:flex w-[228px] h-full border-r border-[#233026] shrink-0">
        <SidebarContent />
      </aside>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80"
          />
          <div className="relative z-10 w-[228px] h-full border-r border-[#233026] bg-[#0b120a]">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
