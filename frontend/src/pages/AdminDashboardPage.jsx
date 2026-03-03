import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Database,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Search,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatTime, initials } from "../lib/format";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";

export default function AdminDashboardPage({ me, onLogout }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [detailsById, setDetailsById] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const [activeSection, setActiveSection] = useState(() => {
    const hash = (window.location.hash || "").replace("#", "");
    const valid = ["dashboard", "profile-list", "query-analytics", "index-status", "system-logs"];
    return valid.includes(hash) ? hash : "dashboard";
  });

  useEffect(() => {
    window.history.replaceState(null, "", `#${activeSection}`);
  }, [activeSection]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const listener = (event) => setIsDesktop(event.matches);
    setIsDesktop(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProfiles(true);
        setMessage("");
        const list = await api("/api/admin/profiles");
        const items = Array.isArray(list) ? list : [];
        setProfiles(items);
        if (items.length) {
          setSelectedId(items[0].id);
        }
      } catch (e) {
        setMessage(e.message);
      } finally {
        setLoadingProfiles(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!profiles.length) return;
    const missing = profiles.filter((p) => !detailsById[p.id]);
    if (!missing.length) return;
    let disposed = false;

    (async () => {
      try {
        setLoadingDetails(true);
        const next = {};
        await Promise.all(missing.map(async (p) => {
          try {
            next[p.id] = await api(`/api/admin/profiles/${p.id}/data`);
          } catch {
            // Ignore specific profile fetch failures.
          }
        }));
        if (!disposed && Object.keys(next).length) {
          setDetailsById((prev) => ({ ...prev, ...next }));
        }
      } finally {
        if (!disposed) setLoadingDetails(false);
      }
    })();

    return () => {
      disposed = true;
    };
  }, [profiles, detailsById]);

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => String(p.displayName || "").toLowerCase().includes(q));
  }, [profiles, search]);

  const selectedData = selectedId ? detailsById[selectedId] : null;
  const topQueries = selectedData?.topQueries || [];

  const aggregate = useMemo(() => {
    const rows = profiles.map((p) => {
      const d = detailsById[p.id];
      return { name: p.displayName, queries: Number(d?.totalQueries || 0), results: Number(d?.totalResults || 0) };
    });
    return {
      totalQueries: rows.reduce((s, r) => s + r.queries, 0),
      totalResults: rows.reduce((s, r) => s + r.results, 0),
      activeUsers: [...rows].sort((a, b) => b.queries - a.queries).slice(0, 3)
    };
  }, [profiles, detailsById]);

  const bars = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = [0, 0, 0, 0, 0, 0, 0];
    (selectedData?.history || []).forEach((h) => {
      const d = new Date(h.searchedAt);
      if (!Number.isNaN(d.getTime())) values[(d.getDay() + 6) % 7] += 1;
    });
    const max = Math.max(1, ...values);
    return labels.map((label, i) => ({ label, value: values[i], h: Math.round((values[i] / max) * 100) }));
  }, [selectedData]);

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile-list", label: "Profile Management", icon: Users },
    { id: "query-analytics", label: "Query Analytics", icon: BarChart3 },
    { id: "index-status", label: "Index Status", icon: Database },
    { id: "system-logs", label: "System Logs", icon: Activity }
  ];

  const loading = loadingProfiles || loadingDetails;

  const Section = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Queries</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{aggregate.totalQueries.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stored Results</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{aggregate.totalResults.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Most Active Users</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">{aggregate.activeUsers.map((u) => u.name).join(", ") || "No activity"}</p>
          </Card>
        </div>
      );
    }

    if (activeSection === "profile-list") {
      return (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="p-4">
            <h3 className="text-base font-bold text-slate-900">Profiles</h3>
            <div className="mt-3 space-y-2">
              {filteredProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left ${
                    selectedId === p.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{p.displayName}</p>
                  <p className="text-xs text-slate-500">{Number(detailsById[p.id]?.totalQueries || 0).toLocaleString()} queries</p>
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-base font-bold text-slate-900">Selected Profile</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-500">Profile</span><span className="font-semibold text-slate-800">{selectedData?.profile?.displayName || "-"}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Total Queries</span><span className="font-semibold text-slate-800">{Number(selectedData?.totalQueries || 0).toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Stored Results</span><span className="font-semibold text-slate-800">{Number(selectedData?.totalResults || 0).toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Last Activity</span><span className="font-semibold text-slate-800">{selectedData?.history?.[0]?.searchedAt ? formatTime(selectedData.history[0].searchedAt) : "No activity"}</span></div>
            </div>
          </Card>
        </div>
      );
    }

    if (activeSection === "query-analytics") {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="text-base font-bold text-slate-900">Queries Over Time</h3>
            <div className="mt-4 grid h-48 grid-cols-7 items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              {bars.map((b) => (
                <div key={b.label} className="flex h-full flex-col items-center justify-end gap-1">
                  <div className="w-full rounded-md bg-gradient-to-b from-indigo-500 to-indigo-600" style={{ height: `${Math.max(8, b.h)}%` }} />
                  <span className="text-[10px] font-medium text-slate-500">{b.label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-base font-bold text-slate-900">Top Queries</h3>
            <div className="mt-3 space-y-2">
              {topQueries.map((q) => (
                <div key={q.query} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
                  <span className="text-sm font-semibold text-slate-800">{q.query}</span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{q.count}</span>
                </div>
              ))}
              {!topQueries.length && <p className="text-sm text-slate-500">No query insights yet.</p>}
            </div>
          </Card>
        </div>
      );
    }

    if (activeSection === "index-status") {
      return (
        <Card>
          <h3 className="text-base font-bold text-slate-900">Index Status</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-500">Profiles Loaded</span><span className="font-semibold text-slate-800">{profiles.length}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">Profiles With Analytics</span><span className="font-semibold text-slate-800">{Object.keys(detailsById).length}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">Total Stored Results</span><span className="font-semibold text-slate-800">{aggregate.totalResults.toLocaleString()}</span></div>
          </div>
        </Card>
      );
    }

    return (
      <Card>
        <h3 className="text-base font-bold text-slate-900">System Logs</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between"><span className="text-slate-500">Profiles Fetch</span><span className="font-semibold text-slate-800">{profiles.length ? "OK" : "Empty"}</span></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Analytics Fetch</span><span className="font-semibold text-slate-800">{Object.keys(detailsById).length ? "OK" : "Pending"}</span></div>
          <div className="flex items-center justify-between"><span className="text-slate-500">Current Profile</span><span className="font-semibold text-slate-800">{selectedData?.profile?.displayName || "-"}</span></div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="app-container grid min-h-screen grid-cols-1 gap-4 py-4 lg:grid-cols-[270px_1fr]">
        <AnimatePresence>
          {(sidebarOpen || isDesktop) && (
            <motion.aside
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="card fixed inset-y-4 left-4 z-30 w-64 p-4 lg:static lg:w-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">SEARCH ENGINE</p>
                  <p className="text-xs text-slate-500">Admin Console</p>
                </div>
                <button className="rounded-md p-1 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <List size={16} />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {menu.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveSection(m.id);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${
                      activeSection === m.id
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <m.icon size={16} />
                    {m.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto space-y-2 pt-4">
                <Button variant="ghost" className="w-full" onClick={() => { navigate("/"); }}>
                  View Live Site
                </Button>
                <Button variant="secondary" className="w-full" onClick={onLogout}>
                  <LogOut size={14} />
                  Logout
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <section className="flex min-h-[calc(100vh-2rem)] flex-col">
          <header className="glass sticky top-4 z-20 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 lg:hidden" onClick={() => setSidebarOpen((v) => !v)}>
                <Menu size={16} />
              </button>
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search profiles, queries or logs..." />
              </div>
              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1 sm:flex">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {initials(me?.displayName || "Admin")}
                </div>
                <div className="pr-2">
                  <p className="text-xs font-semibold text-slate-800">{me?.displayName || "Admin"}</p>
                  <p className="text-[11px] text-slate-500">Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
            {message && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}
            {loading ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            ) : (
              <Section />
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
