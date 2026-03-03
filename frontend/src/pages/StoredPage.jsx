import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Save, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";

export default function StoredPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const { showToast } = useToast();

  const load = async () => {
    if (!query.trim()) return;
    try {
      setItems(await api(`/api/search/results?query=${encodeURIComponent(query.trim())}`));
    } catch {
      setItems([]);
      showToast("Failed to load stored results", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">Stored Results</h1>
        <p className="mt-1 text-sm text-slate-500">Fetch, update, and clean persisted search results.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Query text" />
          <Button variant="ghost" onClick={load}>Load</Button>
          <Button variant="danger" onClick={async () => {
          if (!query.trim()) return;
          await api(`/api/search/results?query=${encodeURIComponent(query.trim())}`, { method: "DELETE" });
          showToast("Stored results deleted");
          load();
        }}>Delete by Query</Button>
        </div>
      </Card>

      <div className="grid gap-3">
        {items.map((it) => (
          <Card key={it.resultId || it.id}>
            <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
            <a className="mt-1 inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700" href={it.url} target="_blank" rel="noreferrer">
              <span className="truncate">{it.url}</span>
              <ExternalLink size={14} />
            </a>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={async () => {
                await api(`/api/search/results/${it.resultId || it.id}`, {
                  method: "PUT",
                  body: JSON.stringify({ rank: it.rank, relevanceScore: it.score })
                });
                showToast("Stored result updated");
                load();
              }}>
                <Save size={14} />
                Update
              </Button>
              <Button variant="danger" onClick={async () => {
                await api(`/api/search/results/${it.resultId || it.id}`, { method: "DELETE" });
                showToast("Stored result deleted");
                load();
              }}>
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </Card>
        ))}
        {!items.length && <Card className="p-8 text-center text-sm text-slate-500">No stored results.</Card>}
      </div>
    </motion.div>
  );
}
