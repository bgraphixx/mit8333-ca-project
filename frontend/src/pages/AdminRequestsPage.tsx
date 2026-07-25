import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatCard, StatGrid } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AssignDialog } from "@/components/requests/AssignDialog";
import { useRequests } from "@/hooks/useRequests";
import { useOfficerWorkloads } from "@/hooks/useOfficerWorkloads";
import { categoriesService } from "@/services/categories";
import { PRIORITY_TONE, STATUS_TONE, formatDateTime } from "@/lib/status";
import type { Category, RequestPriority, RequestStatus, ServiceRequest } from "@/types";

const STATUS_OPTIONS: RequestStatus[] = ["Pending", "Assigned", "In Progress", "Completed"];
const PRIORITY_OPTIONS: RequestPriority[] = ["High", "Medium", "Low"];
const PAGE_SIZE = 8;

export default function AdminRequestsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [priority, setPriority] = useState("All Priorities");
  const [page, setPage] = useState(1);
  const [assignTarget, setAssignTarget] = useState<ServiceRequest | null>(null);

  const { requests, loading, error, refresh } = useRequests();
  const { workloads, officerByRequest, refresh: refreshWorkloads } = useOfficerWorkloads();

  useEffect(() => {
    categoriesService.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (q && !`${r.title} REQ-${r.id} ${r.submitterName}`.toLowerCase().includes(q)) return false;
      if (category !== "All Categories" && r.category !== category) return false;
      if (status !== "All Statuses" && r.status !== status) return false;
      if (priority !== "All Priorities" && r.priority !== priority) return false;
      return true;
    });
  }, [requests, query, category, status, priority]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const unassigned = requests.filter((r) => !officerByRequest.has(r.id) && r.status !== "Completed").length;
  const inProgress = requests.filter((r) => r.status === "In Progress").length;
  const completed = requests.filter((r) => r.status === "Completed").length;

  function handleFilterChange(setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  async function handleAssigned() {
    await refresh();
    await refreshWorkloads();
  }

  return (
    <>
      <Header title="All Requests" subtitle="Campus-wide maintenance queue" />
      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        <div className="max-w-[1320px]">
          <StatGrid>
            <StatCard label="Total requests" value={requests.length} />
            <StatCard label="Unassigned" value={unassigned} />
            <StatCard label="In Progress" value={inProgress} />
            <StatCard label="Completed" value={completed} />
          </StatGrid>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-3.5 py-3 border-b border-border flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 min-w-[220px]">
                <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
                <Input
                  placeholder="Search by title, ID, requester…"
                  className="pl-8"
                  value={query}
                  onChange={(e) => handleFilterChange(setQuery)(e.target.value)}
                />
              </div>
              <Select value={category} onChange={(e) => handleFilterChange(setCategory)(e.target.value)}>
                <option>All Categories</option>
                {categories.map((c) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </Select>
              <Select value={status} onChange={(e) => handleFilterChange(setStatus)(e.target.value)}>
                <option>All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <Select value={priority} onChange={(e) => handleFilterChange(setPriority)(e.target.value)}>
                <option>All Priorities</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </div>

            {loading && <div className="p-4 text-sm text-fg-muted">Loading…</div>}
            {error && <div className="p-4 text-sm text-red-fg">{error}</div>}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px] min-w-[1040px]">
                  <thead>
                    <tr className="text-fg-muted text-left">
                      {["Request", "Category", "Requester", "Priority", "Status", "Officer", ""].map((h, i) => (
                        <th
                          key={h + i}
                          className={`font-medium text-[11.5px] tracking-[0.04em] uppercase px-4 py-2.5 border-b border-border ${i === 6 ? "text-right" : ""}`}
                        >
                          {i === 6 ? "Action" : h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => {
                      const officer = officerByRequest.get(r.id);
                      return (
                        <tr key={r.id} className="border-b border-border hover:bg-hover">
                          <td className="px-4 py-[11px]">
                            <div className="cursor-pointer" onClick={() => navigate(`/requests/${r.id}`)}>
                              <div className="font-semibold text-[13.5px]">{r.title}</div>
                              <div className="text-[11.5px] text-fg-muted mt-0.5">
                                <span className="font-mono">REQ-{r.id}</span> · {formatDateTime(r.createdAt)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-[11px] text-fg-muted">{r.category}</td>
                          <td className="px-4 py-[11px] text-fg-muted">{r.submitterName}</td>
                          <td className="px-4 py-[11px]">
                            <Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
                          </td>
                          <td className="px-4 py-[11px]">
                            <Badge tone={STATUS_TONE[r.status]} dot>
                              {r.status}
                            </Badge>
                          </td>
                          <td className={`px-4 py-[11px] ${officer ? "text-fg" : "text-fg-subtle"}`}>
                            {officer?.name ?? "Unassigned"}
                          </td>
                          <td className="px-4 py-[11px] text-right">
                            <Button variant="outline" size="sm" onClick={() => setAssignTarget(r)}>
                              {officer ? "Reassign" : "Assign"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-4 py-[11px] border-t border-border flex items-center gap-3">
              <span className="text-[12.5px] text-fg-muted">
                {total === 0 ? "No requests match your filters" : `Showing ${from}–${to} of ${total} requests`}
              </span>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-[12.5px] text-fg-muted">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>

      <AssignDialog
        request={assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        onAssigned={handleAssigned}
        workloads={workloads}
      />
    </>
  );
}
