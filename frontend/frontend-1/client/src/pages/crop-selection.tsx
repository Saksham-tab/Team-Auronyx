import { useState } from "react";
import { useLocation } from "wouter";
import { useCropContext } from "@/context/crop-context";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wheat, Sprout, ArrowRight } from "lucide-react";

const DEFAULT_BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || "5001";
const DEFAULT_BACKEND_HOST =
  import.meta.env.VITE_BACKEND_HOST || (typeof window !== "undefined" ? window.location.hostname : "localhost");
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${DEFAULT_BACKEND_HOST}:${DEFAULT_BACKEND_PORT}`;

export default function CropSelection() {
  const [, setLocation] = useLocation();
  const { setCropContext } = useCropContext();

  const [selectedCrop, setSelectedCrop] = useState<"Wheat" | "Moong" | null>(null);
  const [sowingDate, setSowingDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleConfirm = async () => {
    if (selectedCrop && sowingDate) {
      try {
        await fetch(`${BACKEND_URL}/api/sowing/publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cropType: selectedCrop,
            sowingDate
          })
        });
      } catch (err) {
        console.error("Failed to publish sowing date", err);
      }
      setCropContext(selectedCrop, new Date(sowingDate));
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-serif font-bold text-foreground mb-4"
          >
            Select Your Crop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            AgriSense will tailor intelligence models for your selection.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedCrop("Wheat")}
            className={`relative p-8 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden group glass card-hover ${selectedCrop === "Wheat"
              ? "border-primary bg-primary/10"
              : "border-border"
              }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedCrop === "Wheat" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-primary"
              }`}>
              <Wheat className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Wheat</h3>
            <p className="text-muted-foreground">Winter crop lifecycle intelligence.</p>
            {selectedCrop === "Wheat" && <motion.div layoutId="glow" className="absolute inset-0 bg-primary/5 pointer-events-none" />}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setSelectedCrop("Moong")}
            className={`relative p-8 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden group glass card-hover ${selectedCrop === "Moong"
              ? "border-primary bg-primary/10"
              : "border-border"
              }`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${selectedCrop === "Moong" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-primary"
              }`}>
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Moong</h3>
            <p className="text-muted-foreground">Summer crop lifecycle intelligence.</p>
            {selectedCrop === "Moong" && <motion.div layoutId="glow" className="absolute inset-0 bg-primary/5 pointer-events-none" />}
          </motion.button>
        </div>

        {selectedCrop && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col items-center"
          >
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Sowing Date</label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="h-14 px-6 rounded-2xl border-2 border-border bg-card text-foreground font-semibold focus:border-primary outline-none transition-all shadow-sm"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            className="h-16 px-12 text-lg rounded-full font-bold shadow-xl shadow-primary/20"
            disabled={!selectedCrop}
            onClick={handleConfirm}
          >
            Confirm & Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
