import { useCallback, useEffect, useState } from "react";
import { requestsService } from "@/services/requests";


export function useOfficerWorkloads() {
  const [workloads, setWorkloads] = useState<Map<number, number>>(new Map());
  const [officerByRequest, setOfficerByRequest] = useState<Map<number, { id: number; name: string }>>(new Map());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await requestsService.list({ limit: 500 });
      const open = rows.filter((r) => r.status !== "Completed");
      const details = await Promise.all(open.map((r) => requestsService.get(r.id)));

      const counts = new Map<number, number>();
      const byRequest = new Map<number, { id: number; name: string }>();
      details.forEach((d) => {
        if (d.assignedOfficerId && d.assignedOfficerName) {
          counts.set(d.assignedOfficerId, (counts.get(d.assignedOfficerId) ?? 0) + 1);
          byRequest.set(d.id, { id: d.assignedOfficerId, name: d.assignedOfficerName });
        }
      });
      setWorkloads(counts);
      setOfficerByRequest(byRequest);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { workloads, officerByRequest, loading, refresh };
}
