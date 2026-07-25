import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { StatCard, StatGrid } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useRequests } from "@/hooks/useRequests";
import { requestsService } from "@/services/requests";
import { PRIORITY_TONE, STATUS_TONE } from "@/lib/status";
import type { RequestStatus } from "@/types";

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const { requests, loading, error, refresh } = useRequests();

  const toStart = requests.filter((r) => r.status === "Assigned").length;
  const inProgress = requests.filter((r) => r.status === "In Progress").length;
  const completed = requests.filter((r) => r.status === "Completed").length;

  async function handleStatusChange(id: number, status: RequestStatus) {
    await requestsService.updateStatus(id, status);
    refresh();
  }

  return (
    <>
      <Header title="Assigned to Me" subtitle="Your active maintenance jobs" />
      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        <div className="max-w-[1220px]">
          <StatGrid>
            <StatCard label="Assigned to me" value={requests.length} />
            <StatCard label="To start" value={toStart} />
            <StatCard label="In Progress" value={inProgress} />
            <StatCard label="Completed" value={completed} />
          </StatGrid>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-[13px] border-b border-border flex items-center gap-2.5">
              <span className="text-[13.5px] font-semibold">Assigned to me</span>
              <span className="text-xs text-fg-muted">Update status inline as you work through each job.</span>
            </div>

            {loading && <div className="p-4 text-sm text-fg-muted">Loading…</div>}
            {error && <div className="p-4 text-sm text-red-fg">{error}</div>}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px] min-w-[900px]">
                  <thead>
                    <tr className="text-fg-muted text-left">
                      {["Request", "Category", "Priority", "Status", ""].map((h, i) => (
                        <th
                          key={h + i}
                          className={`font-medium text-[11.5px] tracking-[0.04em] uppercase px-4 py-2.5 border-b border-border ${i === 4 ? "text-right" : ""}`}
                        >
                          {i === 4 ? "Update" : h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-b border-border hover:bg-hover">
                        <td className="px-4 py-[11px]">
                          <div className="cursor-pointer" onClick={() => navigate(`/requests/${r.id}`)}>
                            <div className="font-semibold text-[13.5px]">{r.title}</div>
                            <div className="text-[11.5px] text-fg-muted mt-0.5">
                              <span className="font-mono">REQ-{r.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-[11px] text-fg-muted">{r.category}</td>
                        <td className="px-4 py-[11px]">
                          <Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
                        </td>
                        <td className="px-4 py-[11px]">
                          <Badge tone={STATUS_TONE[r.status]} dot>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-[11px] text-right whitespace-nowrap">
                          <Select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value as RequestStatus)}
                            className="text-[12.5px] px-2 py-[5px]"
                          >
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
