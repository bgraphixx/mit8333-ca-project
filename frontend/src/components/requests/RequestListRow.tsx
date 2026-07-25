import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_TONE, STATUS_TONE, formatDateTime } from "@/lib/status";
import type { ServiceRequest } from "@/types";

export function RequestListRow({ request }: { request: ServiceRequest }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/requests/${request.id}`)}
      className="bg-card border border-border rounded-[10px] px-4 py-3.5 flex items-center gap-4 cursor-pointer hover:border-border-strong hover:bg-hover"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14.5px] font-semibold">{request.title}</span>
          <span className="font-mono text-[11px] text-fg-subtle">REQ-{request.id}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-[12.5px] text-fg-muted">
          <span>{request.category}</span>
          <span className="text-border-strong">·</span>
          <span>{formatDateTime(request.createdAt)}</span>
        </div>
      </div>
      <Badge tone={PRIORITY_TONE[request.priority]}>{request.priority}</Badge>
      <Badge tone={STATUS_TONE[request.status]} dot>
        {request.status}
      </Badge>
      <ChevronRight size={16} className="flex-none text-fg-subtle" />
    </div>
  );
}
