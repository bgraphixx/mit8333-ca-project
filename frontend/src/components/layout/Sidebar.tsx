import { NavLink } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { useSidebar } from "@/features/layout/SidebarContext";
import { initials } from "@/lib/status";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  officer: "Maintenance Officer",
  student: "Student / Staff",
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebar();
  if (!user) return null;

  let heading = "Workspace";
  let items: NavItem[] = [{ to: "/", label: "My Requests" }];
  if (user.role === "officer") items = [{ to: "/", label: "Assigned to Me" }];
  if (user.role === "admin") {
    heading = "Administration";
    items = [
      { to: "/", label: "All Requests" },
      { to: "/users", label: "People" },
    ];
  }

  return (
    <aside
      className={cn(
        "flex-none w-[244px] bg-bg-subtle border-r border-border flex flex-col h-screen",
        "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out",
        "lg:sticky lg:top-0 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="px-[18px] pt-[18px] pb-3.5 flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-accent text-white flex items-center justify-center font-bold text-[15px] flex-none">
          M
        </div>
        <div className="leading-tight flex-1">
          <div className="font-semibold text-sm tracking-tight">MIVA</div>
          <div className="text-[11px] text-fg-muted">Maintenance Desk</div>
        </div>
        <button
          onClick={close}
          title="Close menu"
          className="lg:hidden flex-none w-[30px] h-[30px] rounded-lg border border-border bg-card text-fg-muted hover:bg-hover hover:text-fg flex items-center justify-center cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      <div className="px-2.5 pt-1.5 flex-1 overflow-y-auto">
        <div className="text-[11px] font-medium tracking-[0.08em] uppercase text-fg-subtle px-2 pt-2.5 pb-1.5">
          {heading}
        </div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            onClick={close}
            className={({ isActive }) =>
              cn(
                "w-full flex items-center gap-2.5 px-[9px] py-2 mb-0.5 rounded-lg text-[13.5px] font-medium text-left hover:bg-hover",
                isActive ? "bg-card text-fg" : "text-fg-muted",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "w-[7px] h-[7px] rounded-sm flex-none",
                    isActive ? "bg-accent" : "bg-border-strong",
                  )}
                />
                <span className="flex-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5 py-1.5 px-1">
          <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-semibold flex-none">
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
              {user.name}
            </div>
            <div className="text-[11px] text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis">
              {ROLE_LABEL[user.role]}
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="flex-none w-[30px] h-[30px] rounded-lg border border-border bg-card text-fg-muted hover:bg-hover hover:text-fg flex items-center justify-center cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
