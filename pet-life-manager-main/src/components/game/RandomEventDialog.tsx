import { EventChoice, RandomEvent } from "@/lib/game-types";
import { cn } from "@/lib/utils";

interface Props {
  event: RandomEvent | null;
  onChoose: (c: EventChoice) => void;
}

export function RandomEventDialog({ event, onChoose }: Props) {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="hud-panel mx-4 w-full max-w-md rounded-3xl p-6 shadow-2xl ring-1 ring-neon-purple/50 animate-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-5xl drop-shadow-[0_0_12px_oklch(0.55_0.22_305/0.7)]">{event.emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon-purple">Evento</p>
            <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">{event.description}</p>
        <div className="space-y-2">
          {event.choices.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChoose(c)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 text-left transition-all",
                "hover:-translate-y-0.5 hover:border-neon-blue hover:bg-card hover:glow-blue"
              )}
            >
              {c.emoji && <span className="text-2xl">{c.emoji}</span>}
              <span className="flex-1 text-sm font-semibold">{c.label}</span>
              <span className="text-xs text-muted-foreground group-hover:text-neon-blue">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
