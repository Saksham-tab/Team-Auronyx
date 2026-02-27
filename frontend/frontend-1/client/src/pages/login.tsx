import { useLocation } from "wouter";
import { useCropContext } from "@/context/crop-context";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, cropType } = useCropContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    if (cropType) {
      setLocation("/");
    } else {
      setLocation("/setup");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-chart-2/5 blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-10 glass rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-primary/20 shadow-xl shadow-primary/5"
          >
            <Leaf className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-serif font-black text-foreground text-center tracking-tighter"
          >
            AgriSense
          </motion.h1>
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-muted-foreground mt-3 text-center font-medium opacity-80"
          >
            Deep Forest Night • AI Intelligence
          </motion.p>
        </div>

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onSubmit={handleLogin} 
          className="space-y-8"
        >
          <div className="space-y-3">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest font-black opacity-60 ml-1">Identity</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="farmer@agrisense.com" 
              required 
              className="bg-white/5 h-14 rounded-2xl border-white/10 focus:border-primary/50 text-base px-6 transition-all"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest font-black opacity-60 ml-1">Security Key</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              className="bg-white/5 h-14 rounded-2xl border-white/10 focus:border-primary/50 text-base px-6 transition-all"
            />
          </div>
          
          <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform" size="lg">
            Initialize Access
          </Button>
        </motion.form>
      </motion.div>
    </div>
  );
}
