import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { rolesService } from "@/services/roles";
import { ROLE_NAME_TO_KEY } from "@/lib/roles";
import type { Role, RoleKey } from "@/types";

const ROLE_META: Record<RoleKey, { label: string; hint: string }> = {
  student: { label: "Student", hint: "& Staff" },
  officer: { label: "Officer", hint: "Maintenance" },
  admin: { label: "Admin", hint: "Oversight" },
};
const ROLE_KEY_ORDER: RoleKey[] = ["student", "officer", "admin"];

export default function AuthPage() {
  const [view, setView] = useState<"login" | "register">("login");
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const isRegister = view === "register";

  useEffect(() => {
    rolesService
      .list()
      .then((fetched) => {
        setRoles(fetched);
        const student = fetched.find((r) => ROLE_NAME_TO_KEY[r.name] === "student");
        setRoleId((student ?? fetched[0])?.id ?? null);
      })
      .catch(() => setRoles([]));
  }, []);

  const roleOptions = ROLE_KEY_ORDER.map((key) => {
    const apiRole = roles.find((r) => ROLE_NAME_TO_KEY[r.name] === key);
    return apiRole ? { id: apiRole.id, key, ...ROLE_META[key] } : null;
  }).filter((o): o is { id: number; key: RoleKey; label: string; hint: string } => o !== null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isRegister) {
      if (!roleId) return;
      await register({ name, email, password, roleId });
    } else {
      await login({ email, password });
    }
    navigate("/", { replace: true });
  }

  function switchView() {
    clearError();
    setView((v) => (v === "login" ? "register" : "login"));
  }

  return (
    <div className="flex min-h-screen">
      {/* Hero */}
      <div className="hidden md:flex flex-1 min-w-0 flex-col justify-between relative overflow-hidden bg-[#0a0a0a] text-[#fafafa] px-[60px] py-14">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(600px circle at 20% 10%, rgba(228,59,49,.18), transparent 45%)",
          }}
        />
        <img src="/miva-logo.svg" alt="MIVA University" className="h-[34px] w-auto relative z-10" />
        <div className="relative z-10 max-w-[420px]">
          <div className="text-[13px] font-medium tracking-[0.14em] uppercase text-accent mb-[18px]">
            Facilities Operations
          </div>
          <div className="text-[30px] leading-[1.25] font-semibold tracking-tight">
            Report it. Track it. Get it fixed.
          </div>
          <div className="text-[15px] leading-relaxed text-[#a1a1a1] mt-4">
            The central maintenance service desk for students, staff, and facilities officers
            across MIVA University campus.
          </div>
          <div className="flex flex-col gap-3.5 mt-[34px]">
            {[
              "Submit requests with photo evidence in seconds",
              "Live status tracking from pending to completed",
              "Officer assignment and campus-wide oversight",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#d4d4d4]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-none" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-[#6b6b6b]">
          © 2026 Ebubechukwu David Ibeh | M.I.T 8333 | Facilities Management Application
        </div>
      </div>

      {/* Form */}
      <div className="flex-none w-full md:w-[520px] md:max-w-[46vw] flex items-center justify-center p-10 bg-bg">
        <form onSubmit={handleSubmit} className="w-full max-w-[380px]">
          <div className="text-[22px] font-semibold tracking-tight">
            {isRegister ? "Create your account" : "Welcome back"}
          </div>
          <div className="text-sm text-fg-muted mt-1.5">
            {isRegister
              ? "Register to submit and track maintenance requests."
              : "Sign in to the MIVA maintenance service desk."}
          </div>

          {isRegister && (
            <>
              <div className="text-xs font-medium text-fg-muted mt-[26px] mb-2.5">Sign in as</div>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRoleId(opt.id)}
                    className={cn(
                      "relative bg-card border border-border rounded-[10px] px-2 py-3 text-center cursor-pointer hover:border-border-strong hover:bg-hover",
                      roleId === opt.id && "border-accent",
                    )}
                  >
                    <div className="text-[13px] font-semibold">{opt.label}</div>
                    <div className="text-[11px] text-fg-muted mt-0.5">{opt.hint}</div>
                    {roleId === opt.id && (
                      <div className="absolute inset-0 border-2 border-accent rounded-[10px] pointer-events-none shadow-[0_0_0_4px_var(--ring)]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3.5 mt-[22px]">
            {isRegister && (
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Ada Obi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@miva.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            {error && <div className="text-[12.5px] text-red-fg bg-red-bg rounded-lg px-3 py-2">{error}</div>}

            <Button type="submit" className="w-full mt-0.5" disabled={loading || (isRegister && !roleId)}>
              {loading ? "Please wait…" : isRegister ? "Create account" : "Continue"}
            </Button>
          </div>

          <div className="text-center text-[13px] text-fg-muted mt-5">
            {isRegister ? "Already have an account?" : "New to the desk?"}{" "}
            <span onClick={switchView} className="text-accent font-medium cursor-pointer">
              {isRegister ? "Sign in" : "Create an account"}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
