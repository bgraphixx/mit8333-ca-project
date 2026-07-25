import { Button } from "@/components/ui/button";

export function EmptyRequests({ onNewRequest }: { onNewRequest: () => void }) {
  return (
    <div className="border border-dashed border-border-strong rounded-xl p-12 text-center text-fg-muted">
      <div className="text-[15px] font-semibold text-fg">No requests yet</div>
      <div className="text-[13px] mt-1.5">Submit your first maintenance request to get started.</div>
      <Button onClick={onNewRequest} size="sm" className="mt-4">
        New Request
      </Button>
    </div>
  );
}
