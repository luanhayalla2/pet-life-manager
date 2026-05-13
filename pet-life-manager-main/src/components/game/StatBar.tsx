import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  icon: string;
  color: "purple" | "blue" | "green" | "yellow" | "red";
  flash?: "up" | "down" | null | undefined;
}

const colorMap: Record<StatBarProps["color"], string> = {
  purple: "from-[oklch(0.55_0.22_305)] to-[oklch(0.45_0.2_290)]",
  blue: "from-[oklch(0.65_0.18_245)] to-[oklch(0.5_0.18_260)]",
  green: "from-[oklch(0.75_0.2_145)] to-[oklch(0.55_0.18_155)]",
  yellow: "from-[oklch(0.85_0.17_90)] to-[oklch(0.7_0.17_70)]",
  red: "from-[oklch(0.7_0.24_25)] to-[oklch(0.55_0.22_15)]",
};

export function StatBar({ label, value, icon, color, flash }: StatBarProps) {
  const v = Math.max(0, Math.min(100, value));
  const low = v < 25;
  return (
    <div className={cn("space-y-1.5 rounded-md px-1 -mx-1", flash === "up" && "flash-up", flash === "down" && "flash-down")}>
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className="text-base">{icon}</span>
          {label}
        </span>
        <span className={cn("tabular-nums", low ? "text-neon-red" : "text-foreground")}>{Math.round(v)}</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-muted/60 ring-1 ring-inset ring-white/5">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500",
            colorMap[color],
            low && "animate-pulse"
          )}
          style={{ width: `${v}%`, boxShadow: low ? "none" : "0 0 12px currentColor" }}
        />
      </div>
    </div>
  );
}