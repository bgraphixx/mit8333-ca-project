import { useAuth } from "@/features/auth/AuthContext";
import StudentDashboard from "./StudentDashboard";
import OfficerDashboard from "./OfficerDashboard";
import AdminRequestsPage from "./AdminRequestsPage";

export default function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === "officer") return <OfficerDashboard />;
  if (user?.role === "admin") return <AdminRequestsPage />;
  return <StudentDashboard />;
}
