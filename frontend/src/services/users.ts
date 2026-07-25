import { api } from "@/lib/api";
import { toUser } from "@/lib/adapters";
import type { ApiUser, User } from "@/types";

export const usersService = {
  async list(params: { skip?: number; limit?: number } = {}): Promise<User[]> {
    const search = new URLSearchParams();
    if (params.skip !== undefined) search.set("skip", String(params.skip));
    if (params.limit !== undefined) search.set("limit", String(params.limit));
    const qs = search.toString() ? `?${search.toString()}` : "";
    const rows = await api.get<ApiUser[]>(`/users/${qs}`);
    return rows.map(toUser);
  },
};
