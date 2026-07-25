import { Menu, Moon, Plus, Sun } from "lucide-react";
import { useTheme } from "@/features/theme/ThemeContext";
import { useSidebar } from "@/features/layout/SidebarContext";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewRequest?: () => void;
}

export function Header({ title, subtitle, onNewRequest }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { open } = useSidebar();

  return (
    <header className="flex-none h-[57px] border-b border-border flex items-center gap-3 px-4 sm:px-6 bg-bg sticky top-0 z-[5]">
      <button
        onClick={open}
        title="Open menu"
        className="lg:hidden flex-none w-[34px] h-[34px] rounded-lg border border-border bg-card text-fg-muted hover:bg-hover hover:text-fg flex items-center justify-center cursor-pointer"
      >
        <Menu size={16} />
      </button>
      <div className="text-[15px] font-semibold tracking-tight truncate">{title}</div>
      {subtitle && <div className="hidden sm:block text-[13px] text-fg-muted truncate">{subtitle}</div>}
      <div className="flex-1" />
      {onNewRequest && (
        <Button onClick={onNewRequest} size="sm" className="h-[34px] flex-none">
          <Plus size={15} strokeWidth={2.2} />
          <span className="hidden sm:inline">New Request</span>
        </Button>
      )}
      <button
        onClick={toggleTheme}
        title="Toggle theme"
        className="flex-none w-[34px] h-[34px] rounded-lg border border-border bg-card text-fg-muted hover:bg-hover hover:text-fg flex items-center justify-center cursor-pointer"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
