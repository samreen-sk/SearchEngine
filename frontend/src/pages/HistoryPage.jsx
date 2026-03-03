import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { formatTime } from "../lib/format";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [err, setErr] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = async () => {
    try {
      setErr("");
      setItems(await api("/api/search/history"));
    } catch (e) {
      setErr(e.message);
      showToast(e.message, "error");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 text-slate-900"><History size={18} /><h1 className="text-2xl font-bold">Search History</h1></div>
        <p className="mt-1 text-sm text-slate-500">Review and replay previous searches.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" onClick={load}>Refresh</Button>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Delete by query text" />
          <Button variant="danger" onClick={async () => {
          if (!query.trim()) return;
          await api(`/api/search/history?query=${encodeURIComponent(query.trim())}`, { method: "DELETE" });
          setQuery("");
          showToast("Query history deleted");
          load();
        }}>Delete Query History</Button>
        </div>
      </Card>
      {err && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</div>}
      <div className="grid gap-3">
        {items.map((it) => (
          <Card key={it.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button className="text-left text-sm font-semibold text-indigo-600 hover:text-indigo-700" onClick={() => { navigate(`/?q=${encodeURIComponent(it.queryText || "")}`); }}>{it.queryText}</button>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>{formatTime(it.searchedAt)}</span>
                <Button variant="danger" className="px-3 py-2" onClick={async () => {
                  await api(`/api/search/history/${it.id}`, { method: "DELETE" });
                  showToast("History item deleted");
                  load();
                }}>
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {!items.length && <Card className="p-8 text-center text-sm text-slate-500">No history found.</Card>}
      </div>
    </motion.div>
  );
}
