import { motion } from "framer-motion";
import {
  BrainCircuit,
  TrendingUp,
  Droplets,
  Wind,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useCropContext } from "@/context/crop-context";

export default function AIAdvisory() {
  const { predictions, sensors } = useCropContext();

  const insights = [
    { label: "Yield Confidence", value: `${predictions?.yieldPrediction ?? 0}%`, trend: "Live", icon: TrendingUp },
    { label: "Health Index", value: `${predictions?.fieldHealthIndex ?? 0}`, trend: "Live", icon: BrainCircuit },
    { label: "Soil Moisture", value: `${sensors?.moisture ?? 0}%`, trend: "Real-time", icon: Wind },
  ];

  const hasAdvisory = Boolean(predictions?.advisory);

  const advisory = hasAdvisory
    ? {
        category: "Irrigation",
        severity: sensors && sensors.moisture < 30 ? "High" : "Medium",
        title: "AI Recommendation",
        description: predictions!.advisory.recommendation,
        action: predictions!.advisory.reasons[0] || "Monitor sensors",
        color: sensors && sensors.moisture < 30 ? "red" : "amber",
      }
    : null;

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div key={insight.label} className="card-base card-lift fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span className="section-label">{insight.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-black text-foreground">{insight.value}</span>
                <span className="text-xs font-bold text-[hsl(var(--primary))]">{insight.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="w-5 h-5 text-[hsl(var(--primary))]" />
          <h2 className="font-serif font-bold text-2xl text-foreground">AI Intelligence Board</h2>
          <span className="status-pill bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)] ml-2">
            AI Engine - Live
          </span>
        </div>

        <div className="space-y-4">
          {!advisory ? (
            <div className="card-base-lg border-2 border-dashed border-border/50 bg-card/30 flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Waiting for live advisory</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xl">
                The advisory card will appear automatically when sensor and prediction streams are received.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-base-lg card-lift flex flex-col md:flex-row items-center gap-6"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                  advisory.color === "red"
                    ? "text-red-500 bg-red-500/10 border-red-500/20"
                    : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                }`}
              >
                <Droplets className="w-7 h-7" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      advisory.color === "red"
                        ? "text-red-500 bg-red-500/10 border-red-500/20"
                        : "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    }`}
                  >
                    {advisory.severity} Severity
                  </span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))] font-semibold">- {advisory.category}</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground">{advisory.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">{advisory.description}</p>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[hsl(var(--border))] md:pl-6 space-y-3">
                <p className="text-xs font-bold text-foreground">Recommended Action:</p>
                <p className="text-[13px] font-medium text-[hsl(var(--muted-foreground))] mb-4">{advisory.action}</p>
                <button
                  className={`w-full md:w-auto px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg shadow-opacity-20 flex items-center justify-center gap-2 ${
                    advisory.color === "red" ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  Execute Action <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="card-base-lg border-dashed border-2 bg-transparent">
        <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
          <h3 className="text-xl font-serif font-bold text-foreground mb-2">Need deeper analysis?</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
            Ask the AI advisor for sector-level diagnostics based on live telemetry and anomaly history.
          </p>
          <button className="btn-primary flex items-center gap-2">
            Ask AI Advisor <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

