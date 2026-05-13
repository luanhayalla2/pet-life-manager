import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  onGain: (amount: number) => void;
}

export function Minigame({ onGain }: Props) {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const trigger = () => {
      // Aparece a cada 15-30 segundos
      const delay = Math.random() * 15000 + 15000;
      return setTimeout(() => {
        setActive(true);
        setPosition({
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
        });
        
        // Some depois de 3 segundos se não clicar
        setTimeout(() => setActive(false), 3000);
        
        trigger();
      }, delay);
    };

    const timer = trigger();
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onGain(10);
        setActive(false);
      }}
      className="fixed z-[100] h-12 w-12 animate-bounce cursor-pointer items-center justify-center rounded-full bg-neon-yellow text-2xl shadow-[0_0_20px_rgba(253,224,71,0.8)] transition hover:scale-125"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      🪙
    </button>
  );
}
