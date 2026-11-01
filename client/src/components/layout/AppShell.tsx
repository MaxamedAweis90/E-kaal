import React, { useEffect, useRef } from "react";
import { useAppStore, NavTab } from "../../store/useAppStore";
import { useDashboardOverview } from "../../api/dashboard";
import { Icons } from "../icons";
import { CalculatorPopover } from "../calculator/CalculatorPopover";
import { cn } from "../../utils/cn";

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    toggleCalculator,
    searchQuery,
    setSearchQuery,
  } = useAppStore();

  const { data: dashboardData } = useDashboardOverview();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener per spec
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + C: Toggle calculator
      if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        toggleCalculator();
      }
      // Ctrl + K or Cmd + K: Focus global search
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Alt + 1..5: Quick navigation
      if (e.altKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("dashboard");
      }
      if (e.altKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("deymaha");
      }
      if (e.altKey && e.key === "3") {
        e.preventDefault();
        setActiveTab("vendor");
      }
      if (e.altKey && e.key === "4") {
        e.preventDefault();
        setActiveTab("products");
      }
      if (e.altKey && e.key === "5") {
        e.preventDefault();
        setActiveTab("reseller");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCalculator, setActiveTab]);

  const navItems: Array<{ id: NavTab; label: string; icon: keyof typeof Icons }> = [
    { id: "dashboard", label: "Dashboard", icon: "Dashboard" },
    { id: "deymaha", label: "Deymaha", icon: "Deymaha" },
    { id: "vendor", label: "Vendor", icon: "Vendor" },
    { id: "products", label: "Products", icon: "Products" },
    { id: "reseller", label: "Reseller", icon: "Reseller" },
    { id: "dir-ogeysiis", label: "Dir Ogeysiis", icon: "Broadcast" },
    { id: "reports", label: "Reports", icon: "Reports" },
  ];

  const sub = dashboardData?.subscription;
  const isExpiringSoon = sub ? sub.remainingDays <= 3 : false;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text antialiased">
      {/* 2.1 Left Navigation Sidebar (240px) */}
      <aside className="w-60 h-full flex flex-col bg-bg-alt border-r border-border shrink-0 select-none">
        {/* Brand Identity Block */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-badge bg-primary-soft flex items-center justify-center text-primary border border-primary/20">
            <Icons.Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[17px] font-extrabold tracking-tight text-text leading-none">
              E-kaal
            </div>
            <div className="text-[9px] font-semibold tracking-wider text-muted uppercase mt-0.5">
              MERCHANT OS
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-badge text-[13px] font-medium transition-all group",
                  isActive
                    ? "bg-surface text-primary border border-border shadow-sm"
                    : "text-muted hover:text-text hover:bg-surface/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-primary" : "text-muted group-hover:text-text"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-3.5 bg-primary rounded-full shadow-[0_0_8px_rgba(31,191,85,0.6)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Block */}
        <div className="p-3 border-t border-border space-y-2">
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-badge text-[13px] font-medium transition-colors",
              activeTab === "settings"
                ? "bg-surface text-primary border border-border"
                : "text-muted hover:text-text hover:bg-surface/50"
            )}
          >
            <Icons.Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <div className="px-3 text-[11px] text-muted/60 font-mono">
            v1.0.0 • E-kaal System
          </div>
        </div>
      </aside>

      {/* Main Framework Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 2.2 Persistent Utility Header (56px) */}
        <header className="h-14 bg-bg-alt border-b border-border px-6 flex items-center justify-between shrink-0 gap-4">
          {/* Global Search */}
          <div className="max-w-md w-full relative">
            <Icons.Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, or product... [Ctrl+K]"
              className="w-full h-9 pl-9 pr-4 bg-surface border border-border rounded-btn text-xs text-text placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors font-sans"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Global Calculator Trigger */}
            <button
              onClick={toggleCalculator}
              className="flex items-center gap-2 h-9 px-3 bg-surface hover:bg-surface-2 border border-border rounded-btn text-xs font-medium text-text transition-colors"
              title="Shortcut: Alt + C"
            >
              <Icons.Calculator className="w-3.5 h-3.5 text-primary" />
              <span>Calculator [Alt+C]</span>
            </button>

            {/* Subscription Status Chip */}
            <div
              className={cn(
                "h-9 px-3 rounded-badge border text-xs font-semibold flex items-center gap-2 transition-colors",
                isExpiringSoon
                  ? "bg-[#1c1212] text-out border-[#4a2121]"
                  : "bg-surface text-primary border-border"
              )}
            >
              <Icons.Clock className="w-3.5 h-3.5" />
              <span>
                {sub
                  ? `${sub.tier.replace("_", " ")} • ${sub.remainingDays}d left`
                  : "1 Month • 30d left"}
              </span>
            </div>

            {/* Merchant Quick Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center font-bold text-xs text-text">
                  M
                </div>
                <div className="w-2.5 h-2.5 bg-in border-2 border-bg-alt rounded-full absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-text leading-tight">Mudnaan Shop</div>
                <div className="text-[10px] text-muted">Merchant Verified</div>
              </div>
            </div>
          </div>
        </header>

        {/* 2.3 Main Content Viewport */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children ? (
            children
          ) : (
            <div className="border border-dashed border-border rounded-card h-[calc(100vh-104px)] bg-bg flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-muted mb-4">
                <Icons.Dashboard className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-muted mb-1">
                No content loaded — screen display slot
              </h3>
              <p className="text-xs text-[#566A5F] max-w-sm">
                Select a module from the sidebar or press Ctrl+K to jump to a ledger.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Persistent Global Calculator Popover */}
      <CalculatorPopover />
    </div>
  );
};
