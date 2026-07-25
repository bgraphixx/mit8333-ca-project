import { api } from "@/lib/api";
import { toUser } from "@/lib/adapters";
import type { ApiUser, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login({ email, password }: LoginPayload) {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return api.post<TokenResponse>("/auth/login", form, { auth: false });
  },

  register({ name, email, password, roleId }: RegisterPayload) {
    return api.post<ApiUser>(
      "/auth/register",
      { name, email, password, role_id: roleId },
      { auth: false },
    );
  },

  async fetchMe(): Promise<User> {
    const apiUser = await api.get<ApiUser>("/auth/me");
    return toUser(apiUser);
  },
};
