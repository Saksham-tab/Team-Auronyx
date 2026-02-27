import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

type CropType = "Wheat" | "Moong" | null;

interface SensorData {
  moisture: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

interface PredictionData {
  drynessPrediction: number;
  yieldPrediction: number;
  fieldHealthIndex: number;
  advisory: {
    recommendation: string;
    reasons: string[];
  };
}

interface AnomalyData {
  type: string;
  severity: string;
  confidence: number;
  timestamp: string;
  image?: string;
  location?: string;
}

interface ActivityItem {
  time: string;
  event: string;
  type: "ok" | "warn" | "info";
}

interface CropState {
  cropType: CropType;
  sowingDate: Date | null;
  setCropContext: (type: CropType, date: Date) => void;
  isAuthenticated: boolean;
  pumpOn: boolean;
  pumpAuto: boolean;
  setPumpStatus: (on: boolean, auto: boolean) => void;
  login: () => void;
  logout: () => void;
  sensors: SensorData | null;
  predictions: PredictionData | null;
  anomalies: AnomalyData[];
  history: SensorData[];
  activityLog: ActivityItem[];
}

const CropContext = createContext<CropState | undefined>(undefined);

const DEFAULT_BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "5001";
const DEFAULT_BACKEND_HOST =
  import.meta.env.VITE_BACKEND_HOST || (typeof window !== "undefined" ? window.location.hostname : "localhost");
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;

export function CropProvider({ children }: { children: ReactNode }) {
  const [cropType, setCropType] = useState<CropType>(null);
  const [sowingDate, setSowingDate] = useState<Date | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pumpOn, setPumpOn] = useState(false);
  const [pumpAuto, setPumpAuto] = useState(true);

  // Real-time states
  const [sensors, setSensors] = useState<SensorData | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [history, setHistory] = useState<SensorData[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated (simulated here)
    // In a real app, use the userId from auth
    const userId = "user_123";

    const socket = io(BACKEND_URL, {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => console.log(`[Socket.IO] Connected to ${BACKEND_URL}`));
    socket.on("connect_error", (err) => {
      console.error(`[Socket.IO] Connection error to ${BACKEND_URL}:`, err.message);
    });

    socket.on("sensor:update", (data: SensorData) => {
      setSensors(data);
      setHistory(prev => [...prev.slice(-23), data]);
    });

    socket.on("prediction:update", (data: PredictionData) => {
      setPredictions(data);
      setActivityLog(prev => [{
        time: new Date().toLocaleTimeString(),
        event: "AI Prediction generated for field health",
        type: "info" as const
      }, ...prev].slice(0, 50));
    });

    socket.on("anomaly:alert", (data: AnomalyData) => {
      setAnomalies(prev => [data, ...prev].slice(0, 50));
      setActivityLog(prev => [{
        time: new Date().toLocaleTimeString(),
        event: `Anomaly detected: ${data.type}`,
        type: "warn" as const
      }, ...prev].slice(0, 50));
    });

    socket.on("pump:update", (data: { status: string }) => {
      setPumpOn(data.status === "running");
      setActivityLog(prev => [{
        time: new Date().toLocaleTimeString(),
        event: `Motor status: ${data.status.toUpperCase()}`,
        type: "ok" as const
      }, ...prev].slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const setCropContext = (type: CropType, date: Date) => {
    setCropType(type);
    setSowingDate(date);
  };

  const setPumpStatus = async (on: boolean, auto: boolean) => {
    // Trigger action on backend
    try {
      await fetch(`${BACKEND_URL}/api/pump/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: on ? "ON" : "OFF" })
      });
      setPumpAuto(auto);
      // setPumpOn will be updated via socket ack
    } catch (err) {
      console.error("Failed to control pump", err);
    }
  };

  const login = () => setIsAuthenticated(true);

  const logout = () => {
    setIsAuthenticated(false);
    setCropType(null);
    setSowingDate(null);
    setPumpOn(false);
    setPumpAuto(true);
    setSensors(null);
    setPredictions(null);
    setAnomalies([]);
    setHistory([]);
    setActivityLog([]);
  };

  return (
    <CropContext.Provider
      value={{
        cropType,
        sowingDate,
        setCropContext,
        isAuthenticated,
        pumpOn,
        pumpAuto,
        setPumpStatus,
        login,
        logout,
        sensors,
        predictions,
        anomalies,
        history,
        activityLog
      }}
    >
      {children}
    </CropContext.Provider>
  );
}

export function useCropContext() {
  const context = useContext(CropContext);
  if (context === undefined) {
    throw new Error("useCropContext must be used within a CropProvider");
  }
  return context;
}
