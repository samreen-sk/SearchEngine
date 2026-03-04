import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";

export default function AdminLoginPage({ me }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (me?.role === "ADMIN") {
      navigate("/admin", { replace: true });
    }
  }, [me, navigate]);

  useEffect(() => {
    const error = location.state?.error;
    if (error) {
      setMessage(error);
      showToast(error, "error");
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, showToast]);

  const login = async () => {
    if (!password.trim()) return;
    try {
      const data = await api("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ password: password.trim() })
      });
      if (data?.accessToken) {
        localStorage.setItem("authToken", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      window.dispatchEvent(new Event("auth-changed"));
      setMessage("");
      showToast("Admin login successful");
      navigate("/admin", { replace: true });
    } catch (e) {
      setMessage(e.message);
      showToast(e.message, "error");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-slate-50 to-pink-50 px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-2xl p-6">
        <div className="mb-4 inline-flex rounded-xl bg-pink-100 p-2 text-pink-600"><LockKeyhole size={18} /></div>
        <h1 className="text-3xl font-bold tracking-tight text-black-600">Admin Access</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in with admin password to open platform analytics.</p>
        <div className="mt-5 space-y-3">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" />
          <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={login}>Continue to Admin Dashboard</Button>
        </div>
        {message && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</div>}
       <Link className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700" to="/profiles">
          <ArrowLeft size={14} />
          Back to profiles
        </Link>
      </motion.div>
    </div>
  );
}
