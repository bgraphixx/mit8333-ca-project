import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/AuthContext";
import { requestsService } from "@/services/requests";
import { PRIORITY_TONE, STATUS_ORDER, STATUS_TONE, formatDateTime } from "@/lib/status";
import type { RequestDetail } from "@/types";

const BACK_LABEL: Record<string, string> = {
  admin: "all requests",
  officer: "assigned jobs",
  student: "my requests",
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    requestsService
      .get(Number(id))
      .then(setRequest)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load request"))
      .finally(() => setLoading(false));
  }, [id]);

  const currentIdx = request ? STATUS_ORDER.indexOf(request.status) : -1;
  const eventByStatus = new Map((request?.statusUpdates ?? []).map((l) => [l.new_status, l]));

  return (
    <>
      <Header title="Request detail" />
      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        <div className="max-w-[960px]">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 bg-transparent border-none text-fg-muted text-[13px] font-medium cursor-pointer p-0 mb-4 hover:text-fg"
          >
            <ArrowLeft size={16} />
            Back to {BACK_LABEL[user?.role ?? "student"]}
          </button>

          {loading && <div className="text-sm text-fg-muted">Loading…</div>}
          {error && <div className="text-sm text-red-fg">{error}</div>}

          {!loading && !error && request && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
              <div className="flex flex-col gap-4">
                <div className="bg-card border border-border rounded-xl px-[22px] py-5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs text-fg-subtle">REQ-{request.id}</span>
                    <Badge tone={STATUS_TONE[request.status]} dot>
                      {request.status}
                    </Badge>
                    <Badge tone={PRIORITY_TONE[request.priority]}>{request.priority} priority</Badge>
                  </div>
                  <div className="text-xl font-semibold tracking-tight mt-2.5">{request.title}</div>
                  <div className="text-sm leading-relaxed text-fg-muted mt-3">{request.description}</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 mt-5 pt-[18px] border-t border-border">
                    <div>
                      <div className="text-[11.5px] text-fg-muted font-medium">Category</div>
                      <div className="text-[13.5px] font-medium mt-0.5">{request.category}</div>
                    </div>
                    <div>
                      <div className="text-[11.5px] text-fg-muted font-medium">Submitted by</div>
                      <div className="text-[13.5px] font-medium mt-0.5">{request.submitterName}</div>
                    </div>
                    <div>
                      <div className="text-[11.5px] text-fg-muted font-medium">Assigned officer</div>
                      <div
                        className={`text-[13.5px] font-medium mt-0.5 ${request.assignedOfficerName ? "" : "text-fg-subtle"}`}
                      >
                        {request.assignedOfficerName ?? "Unassigned"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11.5px] text-fg-muted font-medium">Last updated</div>
                      <div className="text-[13.5px] font-medium mt-0.5">{formatDateTime(request.updatedAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl px-[22px] py-5">
                  <div className="text-[13px] font-semibold text-fg-muted mb-3">Evidence photo</div>
                  {request.evidenceUrl ? (
                    <img
                      src={request.evidenceUrl}
                      alt="Evidence"
                      className="max-h-[240px] w-auto rounded-[10px] border border-border object-cover"
                    />
                  ) : (
                    <div className="text-[13px] text-fg-subtle">No photo was attached to this request.</div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl px-[22px] py-5">
                <div className="text-[13px] font-semibold mb-[18px]">Status timeline</div>
                <div className="flex flex-col">
                  {STATUS_ORDER.map((status, i) => {
                    const done = i <= currentIdx;
                    const event = eventByStatus.get(status);
                    const isLast = i === STATUS_ORDER.length - 1;
                    return (
                      <div key={status} className="flex gap-3">
                        <div className="flex flex-col items-center flex-none w-4">
                          <div
                            className="w-3.5 h-3.5 rounded-full border-2 border-card"
                            style={{
                              background: done ? "var(--accent)" : "var(--border-strong)",
                              boxShadow: `0 0 0 1.5px ${done ? "var(--accent)" : "var(--border-strong)"}`,
                            }}
                          />
                          {!isLast && (
                            <div
                              className="flex-1 w-0.5 min-h-[18px]"
                              style={{ background: i < currentIdx ? "var(--accent)" : "var(--border)" }}
                            />
                          )}
                        </div>
                        <div className="pb-[18px]">
                          <div className={`text-[13.5px] font-semibold ${done ? "text-fg" : "text-fg-subtle"}`}>
                            {status}
                          </div>
                          {event && (
                            <div className="text-[11.5px] text-fg-muted mt-0.5">
                              {formatDateTime(event.timestamp)}
                            </div>
                          )}
                          {event?.note && (
                            <div className="text-[12.5px] text-fg-muted mt-1 leading-snug">{event.note}</div>
                          )}
                          {status === "Pending" && !event && i === 0 && (
                            <div className="text-[11.5px] text-fg-muted mt-0.5">{formatDateTime(request.createdAt)}</div>
                          )}
                          {!done && <div className="text-xs text-fg-subtle mt-0.5">Not reached yet</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
