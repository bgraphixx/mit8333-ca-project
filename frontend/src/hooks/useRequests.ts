import { useCallback, useEffect, useState } from "react";
import { requestsService } from "@/services/requests";
import type { ServiceRequest } from "@/types";


export function useRequests(limit = 500) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await requestsService.list({ limit });
      setRequests(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requests, loading, error, refresh };
}
