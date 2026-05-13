import { cn } from "@/lib/utils";

interface Props {
  onWork: () => void;
  onPlay: () => void;
  onSleep: () => void;
  isSleeping: boolean;
}

const btn = "btn-3d flex flex-1 flex-col items-center gap-1 rounded-xl border border-border bg-card/60 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5";

export function ActionBar({ onWork, onPlay, onSleep, isSleeping }: Props) {
  return (
    <div className="hud-panel flex gap-2 rounded-2xl p-3">
      <button type="button" onClick={onWork} className={cn(btn, "hover:border-neon-blue hover:text-neon-blue hover:glow-blue")}>
        <span className="text-2xl">💼</span>
        Trabalhar
        <span className="text-[10px] text-muted-foreground normal-case">+15 🪙 / -15 ⚡</span>
      </button>
      <button type="button" onClick={onPlay} className={cn(btn, "hover:border-neon-purple hover:text-neon-purple hover:glow-purple")}>
        <span className="text-2xl">🎮</span>
        Brincar
        <span className="text-[10px] text-muted-foreground normal-case">+20 😊 / -10 ⚡</span>
      </button>
      <button
        type="button"
        onClick={onSleep}
        className={cn(btn, "hover:border-neon-blue hover:text-neon-blue", isSleeping && "border-neon-blue text-neon-blue glow-blue")}
      >
        <span className="text-2xl">{isSleeping ? "⏰" : "💤"}</span>
        {isSleeping ? "Acordar" : "Dormir"}
        <span className="text-[10px] text-muted-foreground normal-case">recupera ⚡</span>
      </button>
    </div>
  );
}