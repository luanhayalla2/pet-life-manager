import { ACHIEVEMENTS } from "@/lib/game-types";
import { cn } from "@/lib/utils";

interface Props {
  unlockedIds: string[];
}

export function Achievements({ unlockedIds }: Props) {
  return (
    <div className="hud-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neon-purple">🏆 Conquistas</h2>
        <span className="text-xs text-muted-foreground">
          {unlockedIds.length} / {ACHIEVEMENTS.length} Desbloqueadas
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-xl border transition-all",
                isUnlocked
                  ? "border-[oklch(0.55_0.22_305/0.5)] bg-[oklch(0.55_0.22_305/0.1)] text-white shadow-[0_0_15px_oklch(0.55_0.22_305/0.3)]"
                  : "border-muted/30 bg-muted/10 opacity-30 grayscale"
              )}
              title={`${achievement.name}: ${achievement.description}`}
            >
              <span className="text-2xl">{achievement.emoji}</span>
              
              {/* Tooltip simples */}
              <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 scale-0 rounded-lg bg-popover p-2 text-center text-[10px] shadow-xl transition-all group-hover:scale-100 z-50">
                <p className="font-bold text-neon-purple uppercase">{achievement.name}</p>
                <p className="text-muted-foreground">{achievement.description}</p>
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-popover" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
