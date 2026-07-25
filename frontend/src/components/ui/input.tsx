import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "w-full bg-bg border border-border rounded-lg px-[11px] py-[9px] text-sm text-fg placeholder:text-fg-subtle transition-colors",
        "focus:border-fg-subtle disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
