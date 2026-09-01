import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Clock3, Database, LogOut, RefreshCcw, Search, Shield, Sparkles } from "lucide-react";
import Button from "./ui/Button";

export default function AppShell({ me, children, onLogout, onSwitchProfile }) {
  const menu = [
    { key: "search", label: "Dashboard", href: "/", icon: Search },
    { key: "history", label: "Search History", href: "/history", icon: Clock3 },
    { key: "top", label: "Top Queries", href: "/top", icon: BarChart3 },
    { key: "stored", label: "Stored Results", href: "/stored", icon: Database }
  ];
  if (me?.role === "ADMIN") {
    menu.push({ key: "admin", label: "Admin Dashboard", href: "/admin", icon: Sparkles });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="app-container grid min-h-screen grid-cols-1 gap-4 py-4 lg:grid-cols-[260px_1fr]">
        <aside className="card hidden p-4 lg:flex lg:flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
            <div className="rounded-xl bg-pink-500 p-2 text-white shadow-md"><Search size={18} /></div>
            <div>
              <div className="text-sm font-bold tracking-tight">SEARCH ENGINE</div>
              <div className="text-xs text-slate-500">Realtime Retrieval Platform</div>
            </div>
          </div>
          <div className="pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Main Menu</div>
          <nav className="mt-3 grid gap-1">
            {menu.map((item) => (
              <NavLink
                key={item.key}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                to={item.href}
                end={item.href === "/"}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto space-y-3 pt-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700"><Shield size={14} /> Secure Mode</div>
              <p className="mt-1 text-xs text-emerald-600">Your searches are profile scoped and encrypted.</p>
            </div>
           <button
             className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-pink-600 hover:bg-pink-700 text-white transition-all"
             onClick={onSwitchProfile}
           >
             <RefreshCcw size={15} />
             Switch Profile
           </button>

           <button
             className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-pink-700 hover:bg-pink-800 text-white transition-all"
             onClick={onLogout}
           >
             <LogOut size={15} />
             Logout
           </button>
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-2rem)] flex-col">
          <header className="glass sticky top-4 z-20 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Engine Status: Optimal</div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">{me?.displayName || "Profile"}</div>
            </div>
          </header>
          <main className="page-enter mt-4 flex-1">{children}</main>
        </section>
      </div>
    </div>
  );
}
