import { useCropContext } from "@/context/crop-context";
import { motion } from "framer-motion";
import {
  Scale,
  Droplets,
  Target,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Clock,
  AlertCircle,
  Info,
} from "lucide-react";

type MoistureBand = { min: number; max: number };

const OPTIMAL_MOISTURE_BY_CROP: Record<string, MoistureBand> = {
  Wheat: { min: 40, max: 60 },
  Moong: { min: 45, max: 65 },
};

function MoistureComparativeAnalysis() {
  const { cropType, sensors, predictions } = useCropContext();

  const selectedBand = cropType ? OPTIMAL_MOISTURE_BY_CROP[cropType] : null;
  const optimalBand = selectedBand ?? { min: 40, max: 60 };
  const optimalMid = (optimalBand.min + optimalBand.max) / 2;
  const currentMoisture = sensors?.moisture ?? 0;

  const deviation = currentMoisture - optimalMid;
  const isLow = currentMoisture < optimalBand.min;
  const isHigh = currentMoisture > optimalBand.max;
  const isOptimal = !isLow && !isHigh;

  const maxDistance = Math.max(optimalMid, 100 - optimalMid);
  const matchLevel = Math.max(0, Math.min(100, 100 - (Math.abs(deviation) / maxDistance) * 100));

  const statusLabel = isOptimal ? "Optimal" : isLow ? "Below Optimal" : "Above Optimal";
  const statusColor = isOptimal
    ? "text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.08)]"
    : "text-amber-600 border-amber-500/30 bg-amber-500/10";

  const guidance = isOptimal
    ? "Soil moisture is within the crop's optimal growth zone."
    : isLow
      ? "Moisture is below target. Irrigation is recommended to improve growth conditions."
      : "Moisture is above target. Reduce irrigation and monitor drainage conditions.";

  const progressWithinScale = Math.max(0, Math.min(100, currentMoisture));

  return (
    <div className="card-base-lg card-lift fade-up flex flex-col h-full" style={{ animationDelay: "0ms" }}>
      <div className="flex items-center gap-3 mb-6">
        <Scale className="w-5 h-5 text-[hsl(var(--primary))]" />
        <h2 className="font-serif font-bold text-xl text-foreground">Comparative Analysis - {cropType || "Select Crop"}</h2>
        <span className={`ml-auto status-pill border ${statusColor}`}>
          {isOptimal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-[hsl(var(--primary))]" />
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Current Moisture</p>
          </div>
          <p className="text-3xl font-serif font-black text-foreground">{currentMoisture.toFixed(1)}%</p>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Optimal Band</p>
          </div>
          <p className="text-3xl font-serif font-black text-foreground">{optimalBand.min}% - {optimalBand.max}%</p>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-[hsl(var(--primary))]" />
            <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Growth Match</p>
          </div>
          <p className="text-3xl font-serif font-black text-foreground">{Math.round(matchLevel)}%</p>
        </div>
      </div>

      <div className="text-center mb-7">
        <p className="text-6xl font-serif font-black text-foreground leading-none">
          {deviation >= 0 ? "+" : ""}
          {deviation.toFixed(1)}%
        </p>
        <p className="text-[hsl(var(--muted-foreground))] text-sm font-medium mt-2">
          Deviation from optimal midpoint ({optimalMid.toFixed(1)}%)
        </p>
      </div>

      <div className="mb-6">
        <div className="h-3 w-full bg-[hsl(var(--secondary))] rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-[hsl(var(--primary)/0.22)]"
            style={{
              width: `${Math.max(0, optimalBand.max - optimalBand.min)}%`,
              marginLeft: `${optimalBand.min}%`,
            }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressWithinScale}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
            className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary)/0.7)] to-[hsl(var(--primary))] relative"
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-[hsl(var(--muted-foreground))] mt-1.5">
          <span>0%</span>
          <span className="text-[hsl(var(--primary))]">Optimal: {optimalBand.min}% - {optimalBand.max}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)] p-5 mt-auto">
        <h4 className="font-bold text-sm text-foreground mb-2">Moisture Match for Optimal Crop Growth</h4>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
          {predictions?.advisory?.recommendation || guidance}
        </p>
      </div>
    </div>
  );
}

function ActivityLog() {
  const { activityLog } = useCropContext();

  return (
    <div className="card-base-lg card-lift fade-up flex flex-col h-full" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center gap-3 mb-5">
        <Clock className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        <h2 className="font-serif font-bold text-xl text-foreground">Activity Log</h2>
      </div>
      <div className="space-y-1 overflow-y-auto flex-1 scrollbar-thin">
        {activityLog.length > 0 ? activityLog.map((item, i) => {
          const ItemIcon = item.type === "ok" ? CheckCircle2 : item.type === "warn" ? AlertCircle : Info;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <ItemIcon
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.type === "ok"
                  ? "text-[hsl(var(--primary))]"
                  : item.type === "warn"
                    ? "text-amber-500"
                    : "text-[hsl(var(--chart-2))]"
                  }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate">{item.event}</p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium mt-0.5">{item.time}</p>
              </div>
            </motion.div>
          );
        }) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-12">
            No active logs yet
          </div>
        )}
      </div>
    </div>
  );
}

export default function CropIntelligence() {
  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 480 }}>
        <div className="lg:col-span-2">
          <MoistureComparativeAnalysis />
        </div>
        <div>
          <ActivityLog />
        </div>
      </div>

    </div>
  );
}
