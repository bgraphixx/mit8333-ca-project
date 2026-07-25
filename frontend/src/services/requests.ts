import { api } from "@/lib/api";
import { toRequestDetail, toServiceRequest } from "@/lib/adapters";
import type {
  ApiServiceRequest,
  ApiServiceRequestDetail,
  ApiStatusUpdate,
  RequestDetail,
  RequestPriority,
  RequestStatus,
  ServiceRequest,
} from "@/types";

export interface NewRequestPayload {
  title: string;
  description: string;
  category_id: number;
  priority: RequestPriority;
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  const s = search.toString();
  return s ? `?${s}` : "";
}

export const requestsService = {
  async list(params: { skip?: number; limit?: number } = {}): Promise<ServiceRequest[]> {
    const rows = await api.get<ApiServiceRequest[]>(`/requests/${qs(params)}`);
    return rows.map(toServiceRequest);
  },

  async get(id: number): Promise<RequestDetail> {
    const row = await api.get<ApiServiceRequestDetail>(`/requests/${id}`);
    return toRequestDetail(row);
  },

  async create(payload: NewRequestPayload): Promise<ServiceRequest> {
    const row = await api.post<ApiServiceRequest>("/requests/", payload);
    return toServiceRequest(row);
  },

  updateStatus(id: number, status: RequestStatus, note?: string) {
    return api.patch<{ message: string }>(`/requests/${id}/status${qs({ new_status: status, note })}`);
  },

  assign(id: number, officerId: number) {
    return api.post<{ message: string }>(`/requests/${id}/assign${qs({ officer_id: officerId })}`);
  },

  logs(id: number) {
    return api.get<ApiStatusUpdate[]>(`/requests/${id}/logs`);
  },

  uploadEvidence(id: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    return api.post<{ evidence_file_url: string }>(`/requests/${id}/evidence`, form);
  },
};
