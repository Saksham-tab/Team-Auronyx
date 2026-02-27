import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "glass inline-flex h-11 w-11 items-center justify-center rounded-2xl text-foreground hover:scale-105 active:scale-95",
        "transition-all duration-300 ease-in-out",
        className,
      )}
    >
      <SunMedium
        className={cn(
          "absolute h-5 w-5 text-amber-500 transition-all duration-300 ease-in-out",
          isDark ? "scale-0 rotate-45 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      />
      <MoonStar
        className={cn(
          "h-5 w-5 text-primary transition-all duration-300 ease-in-out",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-45 opacity-0",
        )}
      />
    </button>
  );
}
