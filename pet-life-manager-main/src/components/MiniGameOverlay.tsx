import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface MiniGameOverlayProps {
  type: string;
  onClose: () => void;
  onComplete: (reward: { coins: number; xp: number }) => void;
}

export function MiniGameOverlay({ type, onClose, onComplete }: MiniGameOverlayProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete({ coins: score * 2, xp: score * 5 });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, score, onComplete]);

  const handleClick = () => {
    setScore((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200 text-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-muted p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-black uppercase tracking-tight text-primary">
          Mini-game: {type}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Clique o mais rápido possível para ganhar pontos!
        </p>

        <div className="mt-6 flex justify-around text-xl font-bold">
          <div>
            <span className="text-muted-foreground block text-xs uppercase">Tempo</span>
            <span className="text-destructive">{timeLeft}s</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs uppercase">Pontos</span>
            <span className="text-reward">{score}</span>
          </div>
        </div>

        <button
          onClick={handleClick}
          className="mt-8 h-32 w-full rounded-2xl bg-[var(--gradient-reward)] text-4xl shadow-[var(--shadow-reward)] active:scale-95 active:shadow-inner transition-transform"
        >
          🎮
        </button>
      </div>
    </div>
  );
}
