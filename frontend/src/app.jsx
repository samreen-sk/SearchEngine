import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import { useSession } from "./hooks/useSession";
import { api } from "./lib/api";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilesPage from "./pages/ProfilesPage";
import SearchPage from "./pages/SearchPage";
import StoredPage from "./pages/StoredPage";
import TopPage from "./pages/TopPage";

function UserShell({ me, onLogout, onSwitchProfile, children }) {
  return <AppShell me={me} onLogout={onLogout} onSwitchProfile={onSwitchProfile}>{children}</AppShell>;
}

function ProtectedUserRoute({ me, loading, children }) {
  const location = useLocation();
  if (loading) return <div className="loading-shell">Loading...</div>;
  const hasToken = Boolean(localStorage.getItem("authToken"));
  if (!me && hasToken) return <div className="loading-shell">Loading...</div>;
  if (me?.role !== "USER") {
    return <Navigate to={`/profiles?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

function AdminRoute({ me, loading, children }) {
  if (loading) return <div className="loading-shell">Loading...</div>;
  const hasToken = Boolean(localStorage.getItem("authToken"));
  if (!me && hasToken) return <div className="loading-shell">Loading...</div>;
  if (!me?.authenticated || me?.role !== "ADMIN") {
    return <Navigate to="/admin-login" replace state={{ error: "Unauthorized access. Admin login required." }} />;
  }
  return children;
}

export default function App() {
  const { loading, me } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && me?.role === "ADMIN" && window.location.pathname === "/admin-login") {
      navigate("/admin", { replace: true });
    }
  }, [loading, me, navigate]);

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore logout response errors.
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("activeProfileId");
    sessionStorage.removeItem("activeProfileName");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/profiles", { replace: true });
  };

  const switchProfile = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("activeProfileId");
    sessionStorage.removeItem("activeProfileName");
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/profiles", { replace: true });
  };

  return (
    <Routes>
      <Route path="/profiles" element={<ProfilesPage />} />
      <Route path="/admin-login" element={<AdminLoginPage me={me} />} />
      <Route
        path="/admin"
        element={
          <AdminRoute me={me} loading={loading}>
            <AdminDashboardPage me={me} onLogout={logout} />
          </AdminRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedUserRoute me={me} loading={loading}>
            <UserShell me={me} onLogout={logout} onSwitchProfile={switchProfile}>
              <SearchPage />
            </UserShell>
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedUserRoute me={me} loading={loading}>
            <UserShell me={me} onLogout={logout} onSwitchProfile={switchProfile}>
              <HistoryPage />
            </UserShell>
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/top"
        element={
          <ProtectedUserRoute me={me} loading={loading}>
            <UserShell me={me} onLogout={logout} onSwitchProfile={switchProfile}>
              <TopPage />
            </UserShell>
          </ProtectedUserRoute>
        }
      />
      <Route
        path="/stored"
        element={
          <ProtectedUserRoute me={me} loading={loading}>
            <UserShell me={me} onLogout={logout} onSwitchProfile={switchProfile}>
              <StoredPage />
            </UserShell>
          </ProtectedUserRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
