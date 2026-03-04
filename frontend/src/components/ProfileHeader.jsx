import React from "react";
import { Search } from "lucide-react";

export default function ProfileHeader() {
  return (
    <header className="glass sticky top-4 z-20 app-container mt-4 rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-pink-500 p-2 text-white shadow-md">
            <Search size={16} />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-slate-900">SEARCH ENGINE</div>
            <div className="text-xs text-slate-500">Secure profile gateway</div>
          </div>
        </div>
        <div className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">
          Realtime Active
        </div>
      </div>
    </header>
  );
}
