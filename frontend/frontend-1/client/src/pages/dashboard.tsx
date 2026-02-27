import { useEffect, useState } from "react";
import { useCropContext } from "@/context/crop-context";
import { AnimatePresence, motion } from "framer-motion";
import {
  Droplets,
  ThermometerSun,
  Wind,
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  X,
  Activity,
  Leaf,
  Sparkles,
  Info,
  Download,
  Zap,
  ZapOff,
  AlertCircle,
  Camera,
} from "lucide-react";
import { downloadReport } from "@/lib/report-generator";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ─── Rolling Number ────────────────────────────────────────────────────
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function RollingNumber({
  value,
  decimals = 0,
  durationMs = 1200,
  className,
}: {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = display;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      setDisplay(from + (value - from) * easeOutCubic(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);
  return <span className={className}>{display.toFixed(decimals)}</span>;
}

// ─── Gauge Color Logic (Reference Schema) ─────────────────────────────
function gaugeColor(val: number, optimal: [number, number], warn: [number, number]) {
  if (val >= optimal[0] && val <= optimal[1]) return "#22c55e"; // Safe Green
  if (val >= warn[0] && val <= warn[1]) return "#f59e0b";      // Warning Orange
  return "#ef4444";                                            // Critical Red
}

// ─── Field Health Index Hero Card ─────────────────────────────────────
function FieldHealthIndexShort() {
  const { predictions } = useCropContext();
  const overallScore = predictions?.fieldHealthIndex || 0;

  const getStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "#22c55e" };
    if (score >= 60) return { label: "Good", color: "#f59e0b" };
    return { label: "Critical", color: "#ef4444" };
  };

  const status = getStatus(overallScore);

  return (
    <div className="card-premium p-6 flex items-center justify-between min-h-[160px]">
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
            <motion.circle
              cx="50" cy="50" r="40" strokeWidth="8" fill="none"
              stroke={status.color}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: overallScore / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeDasharray="251.2"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-foreground">{overallScore}</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Score</span>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="section-label-ref !text-foreground font-bold">Health Score</h3>
          <p className="text-xs text-muted-foreground font-medium max-w-[120px]">Composite stability index</p>
          <div className="pt-2">
            <div
              className="status-pill-ref border"
              style={{ backgroundColor: `${status.color}10`, color: status.color, borderColor: `${status.color}20` }}
            >
              {status.label}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col gap-2 border-l border-border/50 pl-6 ml-6">
        <div className="flex items-center gap-2 justify-between min-w-[100px]">
          <span className="text-[10px] font-bold text-muted-foreground">Stability</span>
          <span className="text-[10px] font-black text-foreground">{overallScore > 70 ? "Stable" : "Volatile"}</span>
        </div>
        <div className="flex items-center gap-2 justify-between">
          <span className="text-[10px] font-bold text-muted-foreground">Active Alerts</span>
          <span className={`text-[10px] font-black ${overallScore < 50 ? "text-red-500" : "text-amber-500"}`}>
            {overallScore < 60 ? "01 Active" : "None"}
          </span>
        </div>
      </div>
    </div>
  );
}

function MotorControlCard() {
  const { pumpOn, pumpAuto, setPumpStatus } = useCropContext();

  return (
    <div className="card-premium p-6 flex flex-col justify-center min-h-[160px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${pumpOn ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-muted-foreground"}`}>
            <Zap className={`w-5 h-5 ${pumpOn ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <h3 className="section-label-ref !text-foreground font-bold">Motor Control</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{pumpOn ? "Running" : "Standby"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setPumpStatus(pumpOn, true)}
            className={`px-3 py-1 text-[9px] font-black rounded-md transition-all ${pumpAuto ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >AUTO</button>
          <button
            onClick={() => setPumpStatus(pumpOn, false)}
            className={`px-3 py-1 text-[9px] font-black rounded-md transition-all ${!pumpAuto ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >MANUAL</button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setPumpStatus(!pumpOn, pumpAuto)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white text-xs transition-all shadow-lg ${pumpOn
            ? "bg-red-500 shadow-red-500/20 hover:bg-red-600"
            : "bg-[hsl(var(--primary))] shadow-primary/20 hover:opacity-90"
            }`}
        >
          {pumpOn ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
          {pumpOn ? "STOP MOTOR" : "START MOTOR"}
        </button>
      </div>
    </div>
  );
}

// ─── 270° Circular Gauge (Premium Reference Style) ───────────────────
function CircularGauge({
  value,
  max = 100,
  label,
  icon: Icon,
  unit,
  status,
  idealRange,
  optimalRange,
  warnRange,
  delay = 0,
  sparkData,
}: {
  value: number;
  max?: number;
  label: string;
  icon: React.ElementType;
  unit: string;
  status: string;
  idealRange: string;
  optimalRange: [number, number];
  warnRange: [number, number];
  delay?: number;
  sparkData: number[];
}) {
  const color = gaugeColor(value, optimalRange, warnRange);
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), delay + 400);
    return () => clearTimeout(t);
  }, [value, delay]);

  const SIZE = 110;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 42;
  const strokeWidth = 9;
  const startAngle = 135;
  const sweepAngle = 270;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + R * Math.cos(rad),
      y: cy + R * Math.sin(rad),
    };
  }
  function describeArc(startDeg: number, endDeg: number) {
    const s = polarToCartesian(startDeg);
    const e = polarToCartesian(endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const endAngle = startAngle + (animated / max) * sweepAngle;
  const trackEnd = startAngle + sweepAngle;

  // sparkline
  const sparkMax = Math.max(...sparkData, 1);
  const sparkMin = Math.min(...sparkData);
  const sparkH = 40;
  const sparkW = 300;
  const pts = sparkData.map((v, i) => {
    const x = (i / (sparkData.length - 1)) * sparkW;
    const y = sparkH - ((v - sparkMin) / (sparkMax - sparkMin + 0.001)) * (sparkH - 10) - 5;
    return `${x},${y}`;
  });
  const sparkPath = `M ${pts.join(" L ")}`;

  const isOptimal = status === "Optimal" || value >= optimalRange[0] && value <= optimalRange[1];
  const isWarning = !isOptimal && (value >= warnRange[0] && value <= warnRange[1]);

  return (
    <div
      className="card-premium flex flex-col pt-6 group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="px-6 flex items-start justify-between mb-4">
        <div className="space-y-1.5">
          <h3 className="section-label-ref !text-foreground font-bold">{label}</h3>
          <div className="flex items-center gap-2.5">
            <span
              className={`status-pill-ref ${isOptimal
                ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
                : isWarning
                  ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
                  : "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isOptimal ? "bg-[#22c55e]" : isWarning ? "bg-[#f59e0b]" : "bg-[#ef4444]"
                  }`}
              />
              {isOptimal ? "Safe" : isWarning ? "Warning" : "Critical"}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium whitespace-nowrap">
              Ideal {idealRange}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 flex items-center justify-between gap-4 h-[100px]">
        {/* Info Column */}
        <div className="space-y-2">
          <p className="section-label-ref">Last 24h</p>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80 hover:text-foreground cursor-pointer transition-colors">
            <Info className="w-3.5 h-3.5" />
            Details
          </div>
        </div>

        {/* Gauge Side */}
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE}>
            <defs>
              <linearGradient id={`grad-${label.replace(/\s+/g, "-")}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="1" />
              </linearGradient>
            </defs>
            <path
              d={describeArc(startAngle, trackEnd)}
              fill="none"
              stroke="currentColor"
              className="text-muted/40"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <motion.path
              d={describeArc(startAngle, Math.max(startAngle + 0.5, endAngle))}
              fill="none"
              stroke={`url(#grad-${label.replace(/\s+/g, "-")})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-1">
            <div className="flex items-baseline">
              <RollingNumber
                value={animated}
                decimals={1}
                className="text-2xl font-serif font-black text-foreground tracking-tight"
              />
              <span className="text-[10px] text-muted-foreground font-bold ml-0.5">{unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sparkline (Filled) */}
      <div className="mt-auto h-16 w-full relative overflow-hidden rounded-b-[2rem]">
        <svg width="100%" height="100%" viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none" className="absolute bottom-0 translate-y-1">
          <defs>
            <linearGradient id={`sparkGrad-${label.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${sparkPath} L ${sparkW},${sparkH} L 0,${sparkH} Z`}
            fill={`url(#sparkGrad-${label.replace(/\s+/g, "-")})`}
          />
          <path
            d={sparkPath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        </svg>
      </div>
    </div>
  );
}



// ─── Dryness Prediction Card (Reverted Params + Premium Style) ───────
function DrynessCard() {
  const { predictions } = useCropContext();
  const daysRemaining = predictions?.drynessPrediction || 0;

  const max = 10;
  const percentage = Math.min((daysRemaining / max) * 100, 100);
  const isSafe = daysRemaining >= 3;

  return (
    <div className="card-premium p-8 flex flex-col min-h-[220px]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="section-label-ref !text-foreground font-bold">Dryness Prediction</h3>
      </div>

      <div className="grid grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="section-label-ref">Time remaining</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-serif font-black text-foreground">{daysRemaining}</span>
              <span className="text-sm text-muted-foreground font-bold">days</span>
            </div>
          </div>
          <p className="text-xs font-bold text-foreground">Until moisture critical threshold</p>
          <div className={`status-pill-ref inline-flex border ${isSafe ? "bg-green-50 border-green-100 text-green-500" : "bg-red-50 border-red-100 text-red-500"
            }`}>
            {isSafe ? "Safe" : "At Risk"}
          </div>
        </div>

        <div className="space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <p className="section-label-ref">Risk Progress</p>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={`h-full ${isSafe ? "bg-primary" : "bg-destructive"}`}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div className={`px-5 py-2.5 rounded-full text-xs font-bold shadow-lg ${isSafe ? "bg-primary text-white shadow-primary/20" : "bg-[#1e4d3a] text-white shadow-[#1e4d3a]/20"
              }`}>
              {isSafe ? "Optimal" : "Check Soil"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Yield Efficiency Card (Reverted Params + Premium Style) ─────────
function YieldEfficiencyCard() {
  const { predictions } = useCropContext();
  const efficiency = predictions?.yieldPrediction || 0;

  return (
    <div className="card-premium p-8 flex flex-col min-h-[220px]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.08)] flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-[hsl(var(--primary))]" />
        </div>
        <h3 className="section-label-ref !text-foreground font-bold">Yield Prediction</h3>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <p className="section-label-ref">Current Efficiency</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-serif font-black text-foreground">{efficiency}</span>
            <span className="text-sm text-muted-foreground font-bold">%</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span className="px-2 py-0.5 bg-secondary rounded-lg text-muted-foreground">{efficiency > 80 ? "Stable" : "Improving"}</span>
            <span className="text-muted-foreground/80">Yield Forecast: High</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-6">
          <div className="status-pill-ref bg-green-50 border-green-100 text-green-500 px-4 py-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Live Insights
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Advisory Section ───────────────────────────────────────────────
function AdvisorySection() {
  const { predictions } = useCropContext();
  const advisory = predictions?.advisory;

  if (!advisory) return null;

  return (
    <div className="card-base-lg card-lift fade-up relative overflow-hidden" style={{ animationDelay: "500ms" }}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-[hsl(var(--primary)/0.04)] rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-serif font-bold text-lg text-foreground">AI Intelligence Feed</h3>
              <span className="status-pill text-[10px] bg-red-500/10 text-red-500 border border-red-500/20">Actionable</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-3xl">
              <strong className="text-foreground">Recommendation: </strong>
              {advisory.recommendation} — {advisory.reasons.join(". ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              window.history.pushState({}, "", "/ai-advisory");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            className="flex-1 md:flex-none btn-primary text-xs py-2.5 px-6 flex items-center justify-center gap-2"
          >
            Execute Action <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Shared chart tooltip style
const TooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  padding: "8px 12px",
  boxShadow: "0 4px 166px rgba(0,0,0,0.1)",
  fontSize: "12px",
};

// ─── Main Dashboard ────────────────────────────────────────────────────
export default function Dashboard() {
  const { pumpAuto, sensors, history, anomalies, predictions } = useCropContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [dismissedAnomaly, setDismissedAnomaly] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!sensors || !predictions) return;
    setIsDownloading(true);
    try {
      await downloadReport({
        batchId: "FS-" + Math.floor(Math.random() * 1000000),
        grade: "A",
        efficiency: predictions.yieldPrediction.toString(),
        dryness: predictions.drynessPrediction.toString(),
        pumpAuto: pumpAuto,
        temperature: sensors.temperature.toString(),
        moisture: sensors.moisture.toString(),
        humidity: sensors.humidity.toString(),
      });
    } catch (err) {
      console.error("Report generation failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const latestAnomaly = anomalies[0];
  const showAnomaly = latestAnomaly && dismissedAnomaly !== latestAnomaly.timestamp;

  return (
    <div className="space-y-8 pb-12">
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-serif font-black text-foreground">Real-Time Analysis</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Monitor storage conditions and AI-backed field intelligence.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading || !sensors}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card hover:bg-muted text-sm font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
            {isDownloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* ── Section 1: Sensor Snapshot (TOP) ── */}
      <div>
        <p className="section-label-ref mb-6">Sensor Snapshot</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CircularGauge
            value={sensors?.temperature || 0}
            label="Temperature"
            icon={ThermometerSun}
            unit="°C"
            status={sensors ? "Live" : "Waiting..."}
            idealRange="24–30°C"
            optimalRange={[24, 30]}
            warnRange={[20, 34]}
            delay={0}
            sparkData={history.map(h => h.temperature)}
          />
          <CircularGauge
            value={sensors?.humidity || 0}
            label="Humidity"
            icon={Wind}
            unit="%"
            status={sensors ? "Live" : "Waiting..."}
            idealRange="55–70%"
            optimalRange={[55, 70]}
            warnRange={[45, 80]}
            delay={120}
            sparkData={history.map(h => h.humidity)}
          />
          <CircularGauge
            value={sensors?.moisture || 0}
            label="Soil Moisture"
            icon={Droplets}
            unit="%"
            status={sensors ? "Live" : "Waiting..."}
            idealRange="40–60%"
            optimalRange={[40, 60]}
            warnRange={[30, 70]}
            delay={240}
            sparkData={history.map(h => h.moisture)}
          />
        </div>
      </div>

      {/* ── Section 2: Overall Score & Motor Control Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FieldHealthIndexShort />
        <MotorControlCard />
      </div>

      {/* ── AI Intelligence Feed ── */}
      <AdvisorySection />

      {/* ── Section 3: AI Predictions ── */}
      <div>
        <p className="section-label-ref mb-6">AI-Driven Predictions</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DrynessCard />
          <YieldEfficiencyCard />
        </div>
      </div>

      {/* ── Anomaly Alert Popup (Fixed side) ── */}
      <AnimatePresence>
        {showAnomaly && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed right-6 bottom-24 z-50 w-80"
          >
            <div className="card-premium !p-0 shadow-2xl border-amber-500/20 bg-white/95 backdrop-blur-xl overflow-hidden ring-1 ring-amber-500/10">
              <div className="bg-amber-500 py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Camera className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Vision Alert</span>
                </div>
                <button onClick={() => setDismissedAnomaly(latestAnomaly.timestamp)} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <h4 className="text-sm font-bold text-foreground mb-1">{latestAnomaly.type} Detected</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Visual anomaly detected with {Math.round(latestAnomaly.confidence * 100)}% confidence.
                  Severity: <span className="font-bold uppercase">{latestAnomaly.severity}</span>.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      window.history.pushState({}, "", "/anomaly-monitoring");
                      window.dispatchEvent(new PopStateEvent("popstate"));
                    }}
                    className="flex-1 py-2 bg-amber-500 text-white text-[10px] font-black rounded-lg hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20"
                  >
                    VIEW DETAILS
                  </button>
                  <button onClick={() => setDismissedAnomaly(latestAnomaly.timestamp)} className="flex-1 py-2 bg-secondary text-foreground text-[10px] font-black rounded-lg hover:bg-border transition-all">
                    DISMISS
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
