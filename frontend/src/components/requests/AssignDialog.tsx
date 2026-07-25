import { useEffect, useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { requestsService } from "@/services/requests";
import { usersService } from "@/services/users";
import { initials } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { ServiceRequest, User } from "@/types";

interface AssignDialogProps {
  request: ServiceRequest | null;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
  workloads: Map<number, number>;
}

export function AssignDialog({ request, onOpenChange, onAssigned, workloads }: AssignDialogProps) {
  const [officers, setOfficers] = useState<User[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      usersService
        .list()
        .then((users) => setOfficers(users.filter((u) => u.role === "officer")))
        .catch(() => setOfficers([]));
      setSelected(null);
    }
  }, [request]);

  async function handleConfirm() {
    if (!request || !selected) return;
    setSubmitting(true);
    try {
      await requestsService.assign(request.id, selected);
      onAssigned();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Assign request</DialogTitle>
          {request && (
            <DialogDescription>
              <span className="font-mono">REQ-{request.id}</span> · {request.title}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogBody>
          <div className="text-xs font-medium text-fg-muted mb-2.5">Select a maintenance officer</div>
          <div className="flex flex-col gap-2">
            {officers.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelected(o.id)}
                className={cn(
                  "relative flex items-center gap-3 text-left bg-bg border border-border rounded-[10px] px-[13px] py-[11px] cursor-pointer hover:bg-hover hover:border-border-strong",
                  selected === o.id && "border-accent",
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gray-bg text-gray-fg flex items-center justify-center text-xs font-semibold flex-none">
                  {initials(o.name)}
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold">{o.name}</div>
                  <div className="text-[11.5px] text-fg-muted">
                    {workloads.get(o.id) ?? 0} active {(workloads.get(o.id) ?? 0) === 1 ? "job" : "jobs"}
                  </div>
                </div>
                {selected === o.id && (
                  <div className="absolute inset-0 border-2 border-accent rounded-[10px] pointer-events-none shadow-[0_0_0_4px_var(--ring)]" />
                )}
              </button>
            ))}
            {officers.length === 0 && (
              <div className="text-sm text-fg-muted">No maintenance officers found.</div>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selected || submitting}>
            {submitting ? "Assigning…" : "Confirm assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
