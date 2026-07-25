import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import type { RoleKey } from "@/types";

export function ProtectedRoute({ roles }: { roles?: RoleKey[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
