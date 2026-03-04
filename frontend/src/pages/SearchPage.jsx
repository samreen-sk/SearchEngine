import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Search as SearchIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const lastExecutedQueryRef = useRef("");

  const run = async (q = query, p = page) => {
    if (!q.trim()) return;
    setStatus("Searching...");
    try {
      const data = await api("/api/search", {
        method: "POST",
        body: JSON.stringify({ query: q.trim(), page: p, size: 10 })
      });
      setResults(Array.isArray(data) ? data : []);
      setStatus(`${(data || []).length} results`);
      showToast("Search completed");
    } catch (e) {
      setResults([]);
      setStatus(e.message);
      showToast(e.message, "error");
    }
  };

  useEffect(() => {
    const q = (new URLSearchParams(location.search).get("q") || "").trim();
    if (q && q !== lastExecutedQueryRef.current) {
      lastExecutedQueryRef.current = q;
      setQuery(q);
      run(q, 0);
    }
  }, [location.search]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="card-style">

      <h1 className="text-5xl font-extrabold text-black">
        Discover the <span className="bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">Realtime Web</span>
      </h1>

      <p className="mt-4 text-gray-600 text-lg">
      Fast intelligent search with personal profiles and stored results.
      </p>

      <div className="mt-6 flex gap-3">
      <Input
       value={query}
       onChange={(e)=>setQuery(e.target.value)}
       placeholder="Search anything..."
      />

      <Button className="bg-pink-500 hover:bg-pink-600 text-white" onClick={()=>run()}>
      <SearchIcon size={16}/>
      Search
      </Button>

      </div>

      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-1">{status || "Latency: ~12ms"}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1">Indexed: 4.2B</span>
        <span className="rounded-full bg-slate-100 px-2 py-1">Last sync: 2s ago</span>
      </div>
      <div className="grid gap-3">
        {results.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-sm font-medium text-slate-500">No results yet. Try searching a keyword to start.</p>
          </Card>
        )}
        {results.map((item) => (
          <Card key={item.resultId || item.pageId || item.url} className="card-style hover:bg-pink-50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-slate-900">{item.title || "Untitled"}</h3>
                <a className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-sm text-indigo-600 hover:text-indigo-700" href={item.url} target="_blank" rel="noreferrer">
                  <span className="truncate">{item.url}</span>
                  <ExternalLink size={14} />
                </a>
                <p className="mt-2 text-sm text-slate-500">Ranked content for your profile with persistent storage and update controls.</p>
              </div>
              <div className="w-full max-w-[190px]">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Relevance</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-pink-600" style={{ width: `${Math.max(8, Math.min(100, Math.round(Number(item.score || 0) * 100)))}%` }} />
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-700">{Math.round(Number(item.score || 0) * 100)}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" onClick={() => { const n = Math.max(0, page - 1); setPage(n); run(query, n); }}>Prev</Button>
        <span className="text-sm font-medium text-slate-600">Page {page}</span>
        <Button variant="ghost" onClick={() => { const n = page + 1; setPage(n); run(query, n); }}>Next</Button>
      </div>
    </motion.div>
  );
}
