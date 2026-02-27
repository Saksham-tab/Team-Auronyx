import { useLocation } from "wouter";
import { useCropContext } from "@/context/crop-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  LayoutDashboard,
  LineChart,
  ShieldAlert,
  LogOut,
  Activity,
  BrainCircuit,
  ChevronRight,
  Clock,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Chatbot } from "@/components/chatbot";

const PAGE_TITLES: Record<string, string> = {
  "/": "Field Dashboard",
  "/intelligence": "Comparative Analysis",
  "/advisory": "AI Recommendation",
  "/anomalies": "Camera Monitoring",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { cropType, logout, pumpOn, pumpAuto, setPumpStatus, predictions } = useCropContext();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/intelligence", label: "Comparative Analysis", icon: LineChart },
    { href: "/advisory", label: "AI Recommendation", icon: BrainCircuit },
    { href: "/anomalies", label: "Camera Monitoring", icon: ShieldAlert },
  ];

  const navigate = (href: string) => {
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const now = new Date();
  const syncTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const pageTitle = PAGE_TITLES[location] ?? "NeuroFarm";

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Background Tints */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* ── Left Sidebar ── */}
      <aside className="w-[260px] min-h-screen flex-shrink-0 sticky top-0 h-screen flex flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] z-10">
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 flex items-center gap-3 border-b border-[hsl(var(--sidebar-border))]">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="HarvestHub Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-serif font-black text-lg leading-none text-foreground tracking-tight">HarvestHub</p>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-semibold uppercase tracking-widest mt-0.5">Collectives & Growth</p>
          </div>
        </div>

        {/* Live Status Mini-Card */}
        <div className="px-4 pt-5">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="section-label">System Status</p>
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.6)]" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">{cropType} Field</p>
            <div className="flex items-center gap-1.5 text-[hsl(var(--primary))] text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              All systems online
            </div>
            <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))] text-xs font-medium mt-2">
              <Clock className="w-3 h-3" />
              Synced {syncTime}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-6 space-y-1">
          <p className="section-label px-3 mb-3">Navigation</p>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${isActive
                  ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.15)]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-foreground hover:bg-[hsl(var(--secondary))]"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[hsl(var(--primary))]" />
                )}
                <item.icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-[hsl(var(--primary))]" : ""}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* AI Advisory Mini-Card (bottom) */}
        <div className="px-4 pb-5 mt-4">
          <div className="rounded-2xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)] p-4">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-[hsl(var(--primary))]" />
              <p className="text-xs font-bold text-foreground">AI Advisory</p>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3">
              {predictions?.advisory?.recommendation || "System monitoring field conditions. Live recommendations will appear here."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
            >
              View Report <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Logout + Theme Toggle row */}
          <div className="mt-4 flex items-center justify-between gap-2 px-1">
            <button
              onClick={logout}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-destructive hover:bg-destructive/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[hsl(var(--background)/0.95)] backdrop-blur-md border-b border-[hsl(var(--border))]">
          <div className="px-8 h-16 flex items-center justify-between gap-4">
            {/* Page title */}
            <div>
              <h1 className="font-serif font-bold text-lg text-foreground leading-none">{pageTitle}</h1>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium mt-0.5">
                {cropType} · Live Monitoring
              </p>
            </div>


            {/* Status pills */}
            <div className="flex items-center gap-2">
              <span className="status-pill bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]" />
                Sensor Online
              </span>
              <span className="status-pill bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))]" />
                MQTT
              </span>
              <span className="status-pill bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">
                <Clock className="w-3 h-3" />
                {syncTime}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-8 py-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <Chatbot />
      </div>
    </div>
  );
}
