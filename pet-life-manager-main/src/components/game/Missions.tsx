import { DAILY_MISSIONS, MissionProgress } from "@/lib/game-types";
import { cn } from "@/lib/utils";

interface Props {
  missions: MissionProgress[];
  onClaim: (id: string) => void;
}

export function Missions({ missions, onClaim }: Props) {
  return (
    <div className="hud-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neon-yellow">🎯 Missões Diárias</h2>
        <span className="text-xs text-muted-foreground">resetam à meia-noite</span>
      </div>
      <ul className="space-y-2">
        {DAILY_MISSIONS.map((m) => {
          const mp = missions.find((x) => x.id === m.id);
          const progress = mp?.progress ?? 0;
          const done = progress >= m.goal;
          const claimed = mp?.claimed;
          const pct = Math.min(100, (progress / m.goal) * 100);
          return (
            <li
              key={m.id}
              className={cn(
                "rounded-xl border p-3 transition",
                claimed ? "border-muted/30 bg-muted/10 opacity-60" : done ? "border-neon-green bg-[oklch(0.7_0.2_145/0.1)]" : "border-border bg-card/40"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{m.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-neon-yellow">+{m.rewardCoins} 🪙</p>
                  <p className="text-[10px] uppercase tracking-wider text-neon-purple">+{m.rewardXp} XP</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[oklch(0.85_0.17_90)] to-[oklch(0.7_0.2_145)] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="tabular-nums text-[10px] text-muted-foreground">{Math.min(progress, m.goal)}/{m.goal}</span>
                <button
                  type="button"
                  disabled={!done || claimed}
                  onClick={() => onClaim(m.id)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition",
                    claimed
                      ? "bg-muted text-muted-foreground cursor-default"
                      : done
                      ? "bg-neon-green text-background hover:scale-105 glow-green"
                      : "bg-muted/40 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {claimed ? "Resgatado" : done ? "Resgatar" : "Em curso"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
