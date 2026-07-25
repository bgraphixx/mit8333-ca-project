export type RoleKey = "student" | "officer" | "admin";
export type RoleName = "Student/Staff" | "Maintenance Officer" | "Administrator";

export interface Role {
  id: number;
  name: RoleName;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role_id: number;
  created_at: string;
  role: Role;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  role: RoleKey;
  roleName: RoleName;
}

export interface Category {
  id: number;
  name: string;
}

export type RequestStatus = "Pending" | "Assigned" | "In Progress" | "Completed";
export type RequestPriority = "Low" | "Medium" | "High" | "Critical";

export interface ApiServiceRequest {
  id: number;
  title: string;
  description: string;
  category_id: number;
  priority: RequestPriority;
  status: RequestStatus;
  evidence_file_url: string | null;
  created_at: string;
  updated_at: string;
  submitted_by: number;
  category: Category;
  submitter: ApiUser;
}

export interface ApiAssignment {
  id: number;
  assigned_officer_id: number;
  assigned_by: number;
  assigned_at: string;
  officer: ApiUser;
}

export interface ApiStatusUpdate {
  id: number;
  updated_by: number;
  old_status: RequestStatus;
  new_status: RequestStatus;
  note: string | null;
  timestamp: string;
}

export interface ApiServiceRequestDetail extends ApiServiceRequest {
  assignments: ApiAssignment[];
  status_updates: ApiStatusUpdate[];
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  evidenceUrl: string | null;
  createdAt: string;
  updatedAt: string;
  submittedById: number;
  submitterName: string;
  assignedOfficerId: number | null;
  assignedOfficerName: string | null;
}

export interface RequestDetail extends ServiceRequest {
  statusUpdates: ApiStatusUpdate[];
}
