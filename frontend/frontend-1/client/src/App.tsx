import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";
import { CropProvider, useCropContext } from "@/context/crop-context";
import { ThemeToggle } from "@/components/theme-toggle";

// Pages
import Login from "@/pages/login";
import CropSelection from "@/pages/crop-selection";
import Dashboard from "@/pages/dashboard";
import CropIntelligence from "@/pages/crop-intelligence";
import AnomalyMonitoring from "@/pages/anomaly-monitoring";
import { useEffect } from "react";

// Guard component to handle routing logic based on PRD
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, cropType } = useCropContext();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location !== "/login") {
      setLocation("/login");
    } else if (isAuthenticated && !cropType && location !== "/setup" && location !== "/login") {
      setLocation("/setup");
    }
  }, [isAuthenticated, cropType, location, setLocation]);

  // Don't wrap login or setup in AppLayout if we don't want the navbar there
  if (location === "/login" || location === "/setup") {
    return <>{children}</>;
  }

  // Only show AppLayout if authenticated and crop is selected
  if (isAuthenticated && cropType) {
    return <AppLayout>{children}</AppLayout>;
  }

  return null; // Will redirect via useEffect
}

import AIAdvisory from "@/pages/ai-advisory";

function Router() {
  return (
    <RouteGuard>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/setup" component={CropSelection} />
        <Route path="/" component={Dashboard} />
        <Route path="/intelligence" component={CropIntelligence} />
        <Route path="/advisory" component={AIAdvisory} />
        <Route path="/anomalies" component={AnomalyMonitoring} />
        <Route component={NotFound} />
      </Switch>
    </RouteGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <CropProvider>
          <TooltipProvider>

            <Toaster />
            <Router />
          </TooltipProvider>
        </CropProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
