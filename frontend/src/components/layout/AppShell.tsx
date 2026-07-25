import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "@/features/layout/SidebarContext";

function MobileBackdrop() {
  const { isOpen, close } = useSidebar();
  if (!isOpen) return null;
  return (
    <div
      onClick={close}
      className="fixed inset-0 z-30 bg-black/50 lg:hidden animate-[overlay-in_0.12s_ease]"
    />
  );
}

export function AppShell() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <MobileBackdrop />
        <div className="flex-1 min-w-0 flex flex-col">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
}
