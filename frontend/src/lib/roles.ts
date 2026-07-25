import type { RoleKey, RoleName } from "@/types";

export const ROLE_NAME_TO_KEY: Record<RoleName, RoleKey> = {
  "Student/Staff": "student",
  "Maintenance Officer": "officer",
  Administrator: "admin",
};

export const ROLE_KEY_TO_LABEL: Record<RoleKey, RoleName> = {
  student: "Student/Staff",
  officer: "Maintenance Officer",
  admin: "Administrator",
};
