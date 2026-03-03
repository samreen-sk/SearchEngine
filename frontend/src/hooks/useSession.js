import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function useSession() {
  const [state, setState] = useState({ loading: true, me: null });

  const refresh = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const me = await api("/api/auth/me");
      setState({ loading: false, me: me?.authenticated ? me : null });
    } catch {
      setState({ loading: false, me: null });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const onAuthChanged = () => refresh();
    window.addEventListener("auth-changed", onAuthChanged);
    return () => window.removeEventListener("auth-changed", onAuthChanged);
  }, []);

  return { ...state, refresh };
}
