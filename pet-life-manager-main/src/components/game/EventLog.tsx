import { GameState } from "@/lib/game-types";
import { cn } from "@/lib/utils";

const kindClass = {
  info: "text-muted-foreground",
  good: "text-neon-green",
  bad: "text-neon-red",
};

export function EventLog({ log }: { log: GameState["log"] }) {
  return (
    <div className="hud-panel rounded-2xl p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-neon-purple">📜 Eventos</h2>
      <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {log.map((e) => (
          <li key={e.id} className={cn("flex items-baseline gap-2 text-xs", kindClass[e.kind])}>
            <span className="text-[10px] tabular-nums opacity-50">
              {new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span>{e.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}