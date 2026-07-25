import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "block text-xs font-medium text-fg-muted mb-1.5",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
