import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/features/theme/ThemeContext";
import { ProtectedRoute, GuestRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import AuthPage from "@/pages/AuthPage";
import DashboardRouter from "@/pages/DashboardRouter";
import AdminUsersPage from "@/pages/AdminUsersPage";
import RequestDetailPage from "@/pages/RequestDetailPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardRouter />} />
                <Route path="/requests/:id" element={<RequestDetailPage />} />
                <Route element={<ProtectedRoute roles={["admin"]} />}>
                  <Route path="/users" element={<AdminUsersPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
