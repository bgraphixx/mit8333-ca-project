import * as React from "react";
import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "bg-bg border border-border rounded-lg px-[10px] py-[8px] text-sm text-fg cursor-pointer transition-colors",
        "focus:border-fg-subtle disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
