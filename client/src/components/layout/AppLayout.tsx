import React from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { useViewportScale } from "../../hooks/useViewportScale";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { zoom, width, height } = useViewportScale();

  return (
    <div
      style={{ zoom, width, height }}
      className="flex overflow-hidden bg-[#0b120a] text-[#f1f5f2] font-sans antialiased select-none"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopHeader />

        <main className="flex-1 min-h-0 px-6 py-6 overflow-y-auto bg-grid-pattern flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
