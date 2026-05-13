import petBaby from "@/assets/pet-baby.png";
import petYoung from "@/assets/pet-young.png";
import petTeen from "@/assets/pet-teen.png";
import petAdult from "@/assets/pet-adult.png";
import petElder from "@/assets/pet-elder.png";
import { PetState } from "@/lib/game-types";
import { cn } from "@/lib/utils";

interface Props {
  pet: PetState;
  onRename: (n: string) => void;
}

function moodLabel(p: PetState) {
  if (p.isSleeping) return { text: "Dormindo 💤", color: "text-neon-blue" };
  if (p.health < 30) return { text: "Doente 🤒", color: "text-neon-red" };
  const avg = (p.hunger + p.energy + p.happiness + p.hygiene) / 4;
  if (avg > 70) return { text: "Feliz ✨", color: "text-neon-green" };
  if (avg > 40) return { text: "Ok 🙂", color: "text-neon-yellow" };
  return { text: "Triste 😢", color: "text-neon-red" };
}

export function PetDisplay({ pet, onRename }: Props) {
  const mood = moodLabel(pet);
  const xpPct = (pet.xp / (pet.level * 50)) * 100;
  const stage = pet.level >= 15 ? "elder" : pet.level >= 10 ? "adult" : pet.level >= 6 ? "teen" : pet.level >= 3 ? "young" : "baby";
  const petImg = stage === "elder" ? petElder : stage === "adult" ? petAdult : stage === "teen" ? petTeen : stage === "young" ? petYoung : petBaby;
  const stageLabel = stage === "elder" ? "ANSIÃO" : stage === "adult" ? "ADULTO" : stage === "teen" ? "ADOLESCENTE" : stage === "young" ? "JOVEM" : "BEBÊ";
  return (
    <div className="hud-panel relative flex flex-col items-center gap-4 rounded-2xl p-6">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => {
            const n = prompt("Novo nome do pet:", pet.name);
            if (n && n.trim()) onRename(n.trim().slice(0, 16));
          }}
          className="text-left text-lg font-bold tracking-tight hover:text-neon-purple transition"
        >
          {pet.name}
        </button>
        <span className={cn("text-xs font-semibold uppercase tracking-widest", mood.color)}>
          {mood.text}
        </span>
      </div>

      <div className="relative flex h-56 w-56 items-center justify-center">
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[oklch(0.55_0.22_305/0.4)] to-[oklch(0.65_0.18_245/0.3)] blur-2xl" />
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 rounded-full bg-[oklch(0.55_0.22_305/0.25)] border border-[oklch(0.55_0.22_305/0.5)] px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-neon-purple">
          {stageLabel}
        </span>
        <img
          src={petImg}
          alt={pet.name}
          width={224}
          height={224}
          className={cn(
            "relative z-10 h-56 w-56 object-contain drop-shadow-[0_8px_24px_oklch(0.55_0.22_305/0.6)]",
            pet.isSleeping ? "opacity-70 grayscale-[0.3]" : "animate-float"
          )}
        />
        {pet.isSleeping && (
          <div className="absolute right-6 top-6 z-20 text-3xl text-neon-blue animate-pulse">Z</div>
        )}
      </div>

      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-neon-purple">NÍVEL {pet.level}</span>
          <span className="tabular-nums text-muted-foreground">
            {pet.xp} / {pet.level * 50} XP
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.22_305)] to-[oklch(0.65_0.18_245)] transition-all"
            style={{ width: `${xpPct}%`, boxShadow: "0 0 10px oklch(0.55 0.22 305 / 0.8)" }}
          />
        </div>
      </div>
    </div>
  );
}