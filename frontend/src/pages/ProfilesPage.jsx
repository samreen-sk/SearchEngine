import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, PlusCircle, Trash2, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileHeader from "../components/ProfileHeader";
import { api } from "../lib/api";
import { formatTime, initials } from "../lib/format";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const load = async () => {
    try {
      setProfiles(await api("/api/profiles"));
    } catch (e) {
      setMsg(e.message);
      showToast(e.message, "error");
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim() || !password.trim()) return;
    try {
      const created = await api("/api/profiles", {
        method: "POST",
        body: JSON.stringify({ displayName: name.trim(), password: password.trim() })
      });
      setProfiles([created, ...profiles]);
      setName("");
      setPassword("");
      setMsg("Profile created.");
      showToast("Profile created");
    } catch (e) {
      setMsg(e.message);
      showToast(e.message, "error");
    }
  };

  const login = async (profile) => {
    const pwd = window.prompt(`Enter password for "${profile.displayName}"`);
    if (!pwd) return;
    try {
      const data = await api("/api/auth/profile-login", {
        method: "POST",
        body: JSON.stringify({ profileId: profile.id, password: pwd })
      });
      if (data?.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      window.dispatchEvent(new Event("auth-changed"));
      sessionStorage.setItem("activeProfileId", String(data.profileId));
      sessionStorage.setItem("activeProfileName", data.displayName || profile.displayName);
      const next = (new URLSearchParams(location.search).get("next") || "/").trim();
      navigate(next || "/", { replace: true });
    } catch (e) {
      setMsg(e.message);
      showToast(e.message, "error");
    }
  };

  const remove = async (profile) => {
    const pwd = window.prompt(`Enter password to delete "${profile.displayName}"`);
    if (!pwd) return;
    try {
      await api(`/api/profiles/${profile.id}`, {
        method: "DELETE",
        body: JSON.stringify({ password: pwd })
      });
      setProfiles(profiles.filter((p) => p.id !== profile.id));
      setMsg("Profile deleted.");
      showToast("Profile deleted");
    } catch (e) {
      setMsg(e.message);
      showToast(e.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <ProfileHeader />
      <section className="app-container mt-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Who's searching?</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base">Select a secure profile to access your encrypted workspace.</p>
      </section>

      {msg && <div className="app-container mt-4"><div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{msg}</div></div>}

      <section className="app-container mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((p) => (
          <motion.article whileHover={{ y: -4 }} className="card-style relative flex min-h-[250px] flex-col items-center justify-center gap-3 p-5" key={p.id}>
            <button className="absolute right-3 top-3 rounded-lg border border-rose-100 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100" onClick={() => remove(p)} aria-label="Delete profile">
              <Trash2 size={14} />
            </button>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-pink-100 text-pink-600"><UserRound size={24} /></div>
            <h3 className="text-lg font-bold text-slate-900">{p.displayName}</h3>
            <p className="text-xs text-slate-500">{formatTime(p.createdAt)}</p>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={() => login(p)}>
              <Lock size={14} />
              Unlock
            </Button>
          </motion.article>
        ))}


        <motion.article
        whileHover={{ y: -6 }}
        className="card-style flex min-h-[250px] flex-col justify-center gap-3 p-5 border-2 border-black shadow-[8px_8px_0px_black] transition hover:-translate-y-1"
        >
          <div className="flex items-center gap-2 text-slate-900"><PlusCircle size={18} /><h3 className="text-lg font-bold">Add Profile</h3></div>
          <p className="text-sm text-slate-500">Create a new secure vault</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Profile name" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Profile password" />
          <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={create}>
            Create
          </Button>w
        </motion.article>
      </section>
    </div>
  );
}
