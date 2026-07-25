import type { ReactNode } from "react";

export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card border border-border rounded-[10px] px-4 py-3.5">
      <div className="text-xs text-fg-muted font-medium">{label}</div>
      <div className="text-[26px] font-semibold tracking-tight mt-1">{value}</div>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{children}</div>;
}
