import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "amber" | "blue" | "violet" | "green" | "gray" | "red";

const toneClasses: Record<BadgeTone, string> = {
  amber: "bg-amber-bg text-amber-fg",
  blue: "bg-blue-bg text-blue-fg",
  violet: "bg-violet-bg text-violet-fg",
  green: "bg-green-bg text-green-fg",
  gray: "bg-gray-bg text-gray-fg",
  red: "bg-red-bg text-red-fg",
};

function Badge({
  tone = "gray",
  dot = false,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { tone?: BadgeTone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        dot ? "rounded-full px-2.5 py-[3px]" : "rounded-md px-2 py-[2px]",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export { Badge };
