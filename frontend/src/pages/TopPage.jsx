import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { api } from "../lib/api";
import Card from "../components/ui/Card";

export default function TopPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api("/api/search/top").then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 text-slate-900"><Trophy size={18} /><h1 className="text-2xl font-bold">Top Queries</h1></div>
        <p className="mt-1 text-sm text-slate-500">Most searched keywords for your profile.</p>
      </Card>
      <div className="grid gap-3">
        {items.map((it, idx) => (
          <Card key={`${it.query}-${idx}`} className="flex items-center justify-between">
            <strong className="text-slate-800">{it.query}</strong>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{it.count} searches</span>
          </Card>
        ))}
        {!items.length && <Card className="p-8 text-center text-sm text-slate-500">No top queries yet.</Card>}
      </div>
    </motion.div>
  );
}
