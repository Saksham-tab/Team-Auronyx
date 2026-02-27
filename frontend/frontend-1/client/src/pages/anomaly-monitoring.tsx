import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Camera,
  X,
  Filter,
  Eye,
  CheckCircle2,
  Activity,
  MapPin,
} from "lucide-react";

import { useCropContext } from "@/context/crop-context";

function SeverityBadge({ severity }: { severity: string }) {
  const cls =
    severity.toLowerCase() === "high"
      ? "bg-red-500/10 text-red-500 border border-red-500/20"
      : severity.toLowerCase() === "medium"
        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
        : "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]";
  return (
    <span className={`status-pill ${cls}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full ${severity.toLowerCase() === "high" ? "bg-red-500" : severity.toLowerCase() === "medium" ? "bg-amber-500" : "bg-[hsl(var(--primary))]"
          }`}
      />
      {severity}
    </span>
  );
}

export default function AnomalyMonitoring() {
  const { anomalies } = useCropContext();
  const [selectedId, setSelectedId] = useState<number>(0);
  const [filter, setFilter] = useState("All");
  const [modalImage, setModalImage] = useState<string | null>(null);

  const filtered = anomalies.filter((a) => filter === "All" || a.severity.toLowerCase() === filter.toLowerCase());
  const selected = filtered[selectedId] || filtered[0];
  const highThreats = anomalies.filter((a) => ["high", "critical"].includes(a.severity.toLowerCase())).length;
  const avgConfidence = anomalies.length
    ? ((anomalies.reduce((sum, item) => sum + (item.confidence || 0), 0) / anomalies.length) * 100).toFixed(1)
    : "0.0";
  const sectorsMonitored = new Set(anomalies.map((a) => a.location).filter(Boolean)).size;

  return (
    <div className="space-y-8 pb-12">
      {/* ── Top Row: Image Preview + Anomaly Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Image Preview */}
        <div className="lg:col-span-2 card-base-lg card-lift fade-up overflow-hidden p-0" style={{ animationDelay: "0ms" }}>
          <div className="relative aspect-video bg-[hsl(var(--secondary))]">
            {selected?.image ? (
              <img
                src={selected.image}
                alt={selected.type}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Camera className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">No Image Evidence</p>
              </div>
            )}
            {/* Bounding box overlay (Simulated for real alerts) */}
            {selected && (
              <div className="absolute top-[22%] left-[28%] w-[38%] h-[46%] border-2 border-red-500 rounded-sm">
                <div className="absolute -top-7 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap">
                  {selected.type} · {Math.round(selected.confidence * 100)}% confidence
                </div>
              </div>
            )}
            {/* Severity badge */}
            {selected && (
              <div className="absolute top-4 right-4">
                <SeverityBadge severity={selected.severity} />
              </div>
            )}
            {/* Expand button */}
            {selected?.image && (
              <button
                onClick={() => setModalImage(selected.image || null)}
                className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-xl hover:bg-black/75 transition-all"
              >
                <Eye className="w-3.5 h-3.5" /> View Full
              </button>
            )}
          </div>
          {/* Caption */}
          {selected && (
            <div className="p-5 flex items-center justify-between border-t border-[hsl(var(--border))]">
              <div>
                <p className="font-serif font-bold text-foreground">{selected.type}</p>
                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] font-medium mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {selected.location || "Main Field"} · {new Date(selected.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">
                AI Vision Network
              </p>
            </div>
          )}
        </div>

        {/* Anomaly Feed List */}
        <div className="card-base-lg card-lift fade-up flex flex-col" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <h3 className="font-serif font-bold text-lg text-foreground">Alert Feed</h3>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1 mb-4 bg-[hsl(var(--secondary))] p-1 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] ml-1.5 flex-shrink-0" />
            {["All", "High", "Medium", "Low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f
                  ? "bg-[hsl(var(--card))] text-foreground shadow-sm"
                  : "text-[hsl(var(--muted-foreground))] hover:text-foreground"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Alert rows */}
          <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin">
            {filtered.map((alert, i) => (
              <motion.button
                key={alert.timestamp + i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setSelectedId(i)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${filtered[selectedId] === alert
                  ? "border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.2)] hover:bg-[hsl(var(--secondary))]"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity.toLowerCase() === "high" ? "bg-red-500" : alert.severity.toLowerCase() === "medium" ? "bg-amber-500" : "bg-[hsl(var(--primary))]"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{alert.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium">{alert.location || "Unknown sector"}</span>
                      <span className="text-[hsl(var(--border))]">·</span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <SeverityBadge severity={alert.severity} />
                </div>
              </motion.button>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm">
                No alerts for this filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Threats */}
        <div className="card-base card-lift fade-up border-red-500/20 bg-red-500/5" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="section-label text-red-500">Active Threats</span>
          </div>
          <p className="text-5xl font-serif font-black text-red-500 mb-2">{highThreats}</p>
          <p className="text-xs text-red-500/70 font-medium">Live high/critical anomaly count</p>
        </div>
        {/* Detection Accuracy */}
        <div className="card-base card-lift fade-up" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <span className="section-label">Detection Accuracy</span>
          </div>
          <p className="text-5xl font-serif font-black text-foreground mb-2">{avgConfidence}%</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">Average confidence from live alerts</p>
        </div>
        {/* Sectors Monitored */}
        <div className="card-base card-lift fade-up" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="section-label">Sectors Monitored</span>
          </div>
          <p className="text-5xl font-serif font-black text-foreground mb-2">{sectorsMonitored}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">Unique sectors reported by live alerts</p>
        </div>
      </div>


      {/* ── Image Modal ── */}
      <AnimatePresence>
        {modalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
            onClick={() => setModalImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full card-base-lg overflow-hidden p-0"
            >
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="relative aspect-video w-full">
                <div className="absolute top-[22%] left-[28%] w-[38%] h-[46%] border-2 border-red-500 z-10">
                  <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 whitespace-nowrap">
                    Anomaly Detected · {selected.confidence}% Confidence
                  </div>
                </div>
                <img src={modalImage} alt="Anomaly Evidence" className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex justify-between items-center border-t border-[hsl(var(--border))]">
                <div>
                  <p className="font-bold text-foreground">{selected.type}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Processed by Vision Model v2.1</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setModalImage(null)}
                >
                  Acknowledge Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
