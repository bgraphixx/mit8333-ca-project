import { api } from "@/lib/api";
import type { Role } from "@/types";

export const rolesService = {
  list: () => api.get<Role[]>("/roles/", { auth: false }),
};
