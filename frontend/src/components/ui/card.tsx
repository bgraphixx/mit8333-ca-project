import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-card border border-border rounded-xl", className)}
      {...props}
    />
  );
}

export { Card };
