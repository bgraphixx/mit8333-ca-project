import { ROLE_NAME_TO_KEY } from "@/lib/roles";
import type { ApiServiceRequest, ApiServiceRequestDetail, ApiUser, RequestDetail, ServiceRequest, User } from "@/types";

export function toUser(u: ApiUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.created_at,
    role: ROLE_NAME_TO_KEY[u.role.name],
    roleName: u.role.name,
  };
}

export function toServiceRequest(r: ApiServiceRequest): ServiceRequest {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    categoryId: r.category_id,
    category: r.category?.name ?? "",
    priority: r.priority,
    status: r.status,
    evidenceUrl: r.evidence_file_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    submittedById: r.submitted_by,
    submitterName: r.submitter?.name ?? "",
    assignedOfficerId: null,
    assignedOfficerName: null,
  };
}

export function toRequestDetail(r: ApiServiceRequestDetail): RequestDetail {
  const base = toServiceRequest(r);
  const latestAssignment = r.assignments[r.assignments.length - 1];
  return {
    ...base,
    assignedOfficerId: latestAssignment?.assigned_officer_id ?? null,
    assignedOfficerName: latestAssignment?.officer?.name ?? null,
    statusUpdates: r.status_updates,
  };
}
