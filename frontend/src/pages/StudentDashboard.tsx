import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { StatCard, StatGrid } from "@/components/StatCard";
import { RequestListRow } from "@/components/requests/RequestListRow";
import { EmptyRequests } from "@/components/requests/EmptyRequests";
import { NewRequestDialog } from "@/components/requests/NewRequestDialog";
import { useRequests } from "@/hooks/useRequests";

export default function StudentDashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { requests, loading, error, refresh } = useRequests();

  const total = requests.length;
  const pending = requests.filter((r) => r.status === "Pending").length;
  const inProgress = requests.filter((r) => r.status === "In Progress").length;
  const completed = requests.filter((r) => r.status === "Completed").length;

  return (
    <>
      <Header
        title="My Requests"
        subtitle="Track everything you've submitted"
        onNewRequest={() => setDialogOpen(true)}
      />
      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        <div className="max-w-[1180px]">
          <StatGrid>
            <StatCard label="Total" value={total} />
            <StatCard label="Pending" value={pending} />
            <StatCard label="In Progress" value={inProgress} />
            <StatCard label="Completed" value={completed} />
          </StatGrid>

          <div className="text-[13px] font-semibold text-fg-muted mb-2.5">My Requests</div>

          {loading && <div className="text-sm text-fg-muted">Loading requests…</div>}
          {error && <div className="text-sm text-red-fg">{error}</div>}
          {!loading && !error && total === 0 && <EmptyRequests onNewRequest={() => setDialogOpen(true)} />}
          {!loading && !error && total > 0 && (
            <div className="flex flex-col gap-2">
              {requests.map((r) => (
                <RequestListRow key={r.id} request={r} />
              ))}
            </div>
          )}
        </div>
      </main>

      <NewRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={refresh} />
    </>
  );
}
