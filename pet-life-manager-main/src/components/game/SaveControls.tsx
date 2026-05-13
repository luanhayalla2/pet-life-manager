import { useRef, useState, useEffect } from "react";
import {
  isMuted, setMuted,
  isCoinMuted, setCoinMuted,
  getCoinVolume, setCoinVolume,
  isHapticsEnabled, setHapticsEnabled,
  prefersReducedMotion, setReducedMotion,
} from "@/lib/sounds";

interface Props {
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

export function SaveControls({ onExport, onImport, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [muted, setLocalMuted] = useState(false);
  const [coinMuted, setLocalCoinMuted] = useState(false);
  const [coinVol, setLocalCoinVol] = useState(1);
  const [haptics, setLocalHaptics] = useState(true);
  const [reduced, setLocalReduced] = useState(false);
  useEffect(() => {
    setLocalMuted(isMuted());
    setLocalCoinMuted(isCoinMuted());
    setLocalCoinVol(getCoinVolume());
    setLocalHaptics(isHapticsEnabled());
    setLocalReduced(prefersReducedMotion());
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setLocalMuted(next);
  };
  const toggleCoinMute = () => {
    const next = !coinMuted;
    setCoinMuted(next);
    setLocalCoinMuted(next);
  };
  const onVolChange = (v: number) => {
    setCoinVolume(v);
    setLocalCoinVol(v);
  };
  const toggleHaptics = () => {
    const next = !haptics;
    setHapticsEnabled(next);
    setLocalHaptics(next);
  };
  const toggleReduced = () => {
    const next = !reduced;
    setReducedMotion(next);
    setLocalReduced(next);
  };

  return (
    <div className="hud-panel space-y-3 rounded-2xl p-3">
      <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onExport}
        className="rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:border-neon-green hover:text-neon-green"
        title="Baixar save em JSON"
      >
        ⬇️ Exportar
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:border-neon-blue hover:text-neon-blue"
        title="Carregar save de JSON"
      >
        ⬆️ Importar
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={toggleMute}
        className="rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:border-neon-yellow hover:text-neon-yellow"
        title="Som"
      >
        {muted ? "🔇 Mudo" : "🔊 Som"}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("Reiniciar o jogo? Isso apaga seu progresso atual.")) onReset();
        }}
        className="ml-auto rounded-lg border border-border bg-card/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:border-neon-red hover:text-neon-red"
      >
        ↻ Reiniciar
      </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        <label className="flex items-center gap-2">
          <span>🪙 Som moeda</span>
          <button
            type="button"
            onClick={toggleCoinMute}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${coinMuted ? "border-neon-red text-neon-red" : "border-neon-green text-neon-green"}`}
          >
            {coinMuted ? "OFF" : "ON"}
          </button>
        </label>
        <label className="flex flex-1 items-center gap-2 min-w-[180px]">
          <span>Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={coinVol}
            onChange={(e) => onVolChange(parseFloat(e.target.value))}
            disabled={coinMuted}
            className="flex-1 accent-[oklch(0.85_0.17_90)] disabled:opacity-40"
          />
          <span className="tabular-nums w-7 text-right">{Math.round(coinVol * 100)}</span>
        </label>
        <label className="flex items-center gap-2">
          <span>📳 Vibração</span>
          <button
            type="button"
            onClick={toggleHaptics}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${haptics ? "border-neon-green text-neon-green" : "border-neon-red text-neon-red"}`}
          >
            {haptics ? "ON" : "OFF"}
          </button>
        </label>
        <label className="flex items-center gap-2">
          <span>✨ Reduzir animações</span>
          <button
            type="button"
            onClick={toggleReduced}
            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${reduced ? "border-neon-yellow text-neon-yellow" : "border-border text-muted-foreground"}`}
          >
            {reduced ? "ON" : "OFF"}
          </button>
        </label>
      </div>
    </div>
  );
}
