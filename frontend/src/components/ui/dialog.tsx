import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-[overlay-in_0.12s_ease]"
      />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-16 z-50 w-[calc(100%-2.5rem)] -translate-x-1/2 rounded-[14px] border border-border bg-card shadow-[0_24px_60px_rgba(0,0,0,0.28)] data-[state=open]:animate-[dialog-in_0.16s_ease] max-h-[calc(100vh-8rem)] overflow-y-auto",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 border-b border-border px-[22px] py-[18px]",
        className,
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      <DialogPrimitive.Close className="flex-none w-[30px] h-[30px] rounded-lg border border-border bg-card text-fg-muted hover:bg-hover hover:text-fg flex items-center justify-center cursor-pointer">
        <X size={15} />
      </DialogPrimitive.Close>
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-[16px] font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-[13px] text-fg-muted mt-0.5", className)}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-[22px] py-5", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex justify-end gap-2.5 border-t border-border px-[22px] py-4",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
};
