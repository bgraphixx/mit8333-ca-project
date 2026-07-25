import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { usersService } from "@/services/users";
import { useOfficerWorkloads } from "@/hooks/useOfficerWorkloads";
import { initials } from "@/lib/status";
import { ROLE_KEY_TO_LABEL } from "@/lib/roles";
import type { BadgeTone } from "@/components/ui/badge";
import type { RoleKey, User } from "@/types";

const ROLE_TONE: Record<RoleKey, BadgeTone> = {
  admin: "red",
  officer: "blue",
  student: "gray",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { workloads } = useOfficerWorkloads();

  useEffect(() => {
    usersService
      .list({ limit: 500 })
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load people"))
      .finally(() => setLoading(false));
  }, []);

  const officerCount = users.filter((u) => u.role === "officer").length;

  return (
    <>
      <Header title="People" subtitle="Users and officers" />
      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        <div className="max-w-[1100px] bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-[13px] border-b border-border flex items-center gap-2.5">
            <span className="text-[13.5px] font-semibold">People</span>
            <span className="text-xs text-fg-muted">
              {users.length} people · {officerCount} officers
            </span>
          </div>

          {loading && <div className="p-4 text-sm text-fg-muted">Loading…</div>}
          {error && <div className="p-4 text-sm text-red-fg">{error}</div>}

          {!loading && !error && (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-fg-muted text-left">
                  {["Name", "Role", "Open jobs"].map((h) => (
                    <th
                      key={h}
                      className="font-medium text-[11.5px] tracking-[0.04em] uppercase px-4 py-2.5 border-b border-border"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const open = workloads.get(u.id) ?? 0;
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-hover">
                      <td className="px-4 py-[11px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[30px] h-[30px] rounded-full bg-gray-bg text-gray-fg flex items-center justify-center text-[11px] font-semibold flex-none">
                            {initials(u.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-[13.5px]">{u.name}</div>
                            <div className="text-[11.5px] text-fg-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-[11px]">
                        <Badge tone={ROLE_TONE[u.role]}>{ROLE_KEY_TO_LABEL[u.role]}</Badge>
                      </td>
                      <td className="px-4 py-[11px] text-fg-muted">
                        {u.role === "officer" ? `${open} ${open === 1 ? "job" : "jobs"}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
