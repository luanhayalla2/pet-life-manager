import { useCallback, useEffect, useRef, useState } from "react";
import {
  ACHIEVEMENTS,
  DAILY_MISSIONS,
  GameState,
  Mission,
  MissionMetric,
  MissionProgress,
  PetState,
  RANDOM_EVENTS,
  RandomEvent,
  EventChoice,
  SHOP_ITEMS,
  ShopItem,
} from "@/lib/game-types";
import { sfx } from "@/lib/sounds";

const STORAGE_KEY = "vida-realista-game-v1";
const TICK_MS = 4000;
const EVENT_TICK_MS = 45000; // chance de evento aleatório

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const today = () => new Date().toISOString().slice(0, 10);

const initialPet = (name = "Neon"): PetState => ({
  name,
  level: 1,
  xp: 0,
  hunger: 80,
  energy: 90,
  happiness: 85,
  hygiene: 90,
  health: 100,
  isSleeping: false,
  lastTick: Date.now(),
});

const emptyCounters = (): Record<MissionMetric, number> => ({
  work: 0, play: 0, buy: 0, useItem: 0, coinsEarned: 0, sleep: 0,
});

const freshMissions = (): MissionProgress[] =>
  DAILY_MISSIONS.map((m) => ({ id: m.id, progress: 0, claimed: false }));

const initialState = (): GameState => ({
  pet: initialPet(),
  coins: 50,
  inventory: [],
  log: [{ id: crypto.randomUUID(), text: "Bem-vindo ao Vida Realista!", time: Date.now(), kind: "info" }],
  unlockedAchievements: [],
  missions: freshMissions(),
  missionsDay: today(),
  counters: emptyCounters(),
  pendingEvent: null,
});

function load(): GameState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    const base = initialState();
    const merged: GameState = {
      ...base,
      ...parsed,
      pet: { ...base.pet, ...parsed.pet },
      unlockedAchievements: parsed.unlockedAchievements || [],
      missions: parsed.missions && parsed.missionsDay === today() ? parsed.missions : freshMissions(),
      missionsDay: today(),
      counters: parsed.missionsDay === today() ? { ...emptyCounters(), ...parsed.counters } : emptyCounters(),
      pendingEvent: null,
    };
    return merged;
  } catch {
    return initialState();
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);
  const popupsRef = useRef<{ id: string; text: string; x: number }[]>([]);
  const flashRef = useRef<Record<string, "up" | "down">>({});
  const [, force] = useState(0);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  // Reset diário
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        if (s.missionsDay !== today()) {
          return { ...s, missions: freshMissions(), missionsDay: today(), counters: emptyCounters() };
        }
        return s;
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Decay tick com diff de stats pra animação flash
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const sleeping = s.pet.isSleeping;
        const next: PetState = {
          ...s.pet,
          hunger: clamp(s.pet.hunger - (sleeping ? 1 : 3)),
          energy: clamp(s.pet.energy + (sleeping ? 8 : -2)),
          happiness: clamp(s.pet.happiness - (sleeping ? 0 : 2)),
          hygiene: clamp(s.pet.hygiene - 1),
          lastTick: Date.now(),
        };
        const critical = [next.hunger, next.energy, next.hygiene].filter((v) => v < 15).length;
        next.health = clamp(next.health - critical);
        if (sleeping && next.energy >= 100) next.isSleeping = false;
        return { ...s, pet: next };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Eventos aleatórios
  useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        if (s.pendingEvent || s.pet.isSleeping) return s;
        if (Math.random() > 0.5) return s;
        const ev = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        sfx.event();
        return { ...s, pendingEvent: ev };
      });
    }, EVENT_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const triggerFlash = useCallback((key: string, dir: "up" | "down") => {
    flashRef.current = { ...flashRef.current, [key]: dir };
    force((n) => n + 1);
    setTimeout(() => {
      const { [key]: _, ...rest } = flashRef.current;
      flashRef.current = rest;
      force((n) => n + 1);
    }, 600);
  }, []);

  const log = useCallback((text: string, kind: "info" | "good" | "bad" = "info") => {
    setState((s) => ({
      ...s,
      log: [{ id: crypto.randomUUID(), text, time: Date.now(), kind }, ...s.log].slice(0, 30),
    }));
  }, []);

  const bumpCounter = useCallback((metric: MissionMetric, by = 1) => {
    setState((s) => {
      const counters = { ...s.counters, [metric]: (s.counters[metric] || 0) + by };
      const missions = s.missions.map((mp) => {
        const def = DAILY_MISSIONS.find((m) => m.id === mp.id);
        if (!def || mp.claimed) return mp;
        if (def.metric !== metric) return mp;
        return { ...mp, progress: Math.min(def.goal, mp.progress + by) };
      });
      return { ...s, counters, missions };
    });
  }, []);

  const addCoins = useCallback((amount: number, silent = false) => {
    setState((s) => ({ ...s, coins: Math.max(0, s.coins + amount) }));
    if (amount > 0) {
      bumpCounter("coinsEarned", amount);
      if (!silent) sfx.coin();
    }
    const id = crypto.randomUUID();
    popupsRef.current = [...popupsRef.current, { id, text: `${amount > 0 ? "+" : ""}${amount} 🪙`, x: Math.random() * 60 + 20 }];
    force((n) => n + 1);
    setTimeout(() => {
      popupsRef.current = popupsRef.current.filter((p) => p.id !== id);
      force((n) => n + 1);
    }, 1000);
  }, [bumpCounter]);

  const gainXp = useCallback((amount: number) => {
    setState((s) => {
      let xp = s.pet.xp + amount;
      let level = s.pet.level;
      const need = level * 50;
      if (xp >= need) {
        xp -= need;
        level += 1;
        sfx.good();
      }
      return { ...s, pet: { ...s.pet, xp, level } };
    });
  }, []);

  const work = useCallback(() => {
    let acted = false;
    setState((s) => {
      if (s.pet.energy < 15) return s;
      acted = true;
      triggerFlash("energy", "down");
      return { ...s, pet: { ...s.pet, energy: clamp(s.pet.energy - 15), happiness: clamp(s.pet.happiness - 5) } };
    });
    if (!acted) { sfx.bad(); log("Pet sem energia pra trabalhar!", "bad"); return; }
    sfx.work();
    addCoins(15, true);
    sfx.coin();
    gainXp(10);
    bumpCounter("work");
    log("Você trabalhou e ganhou 15 🪙", "good");
  }, [addCoins, gainXp, log, bumpCounter, triggerFlash]);

  const play = useCallback(() => {
    let acted = false;
    setState((s) => {
      if (s.pet.energy < 10) return s;
      acted = true;
      triggerFlash("happiness", "up");
      return { ...s, pet: { ...s.pet, energy: clamp(s.pet.energy - 10), happiness: clamp(s.pet.happiness + 20), hunger: clamp(s.pet.hunger - 5) } };
    });
    if (!acted) { sfx.bad(); return; }
    sfx.play();
    addCoins(5, true);
    gainXp(5);
    bumpCounter("play");
    log("Brincou com o pet (+20 felicidade)", "good");
  }, [addCoins, gainXp, log, bumpCounter, triggerFlash]);

  const sleep = useCallback(() => {
    sfx.sleep();
    setState((s) => ({ ...s, pet: { ...s.pet, isSleeping: !s.pet.isSleeping } }));
    bumpCounter("sleep");
    log("Pet foi dormir 💤", "info");
  }, [log, bumpCounter]);

  const buyItem = useCallback((item: ShopItem) => {
    let bought = false;
    setState((s) => {
      if (s.coins < item.price) return s;
      bought = true;
      const existing = s.inventory.find((i) => i.itemId === item.id);
      const inventory = existing
        ? s.inventory.map((i) => (i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...s.inventory, { itemId: item.id, quantity: 1 }];
      return { ...s, coins: s.coins - item.price, inventory };
    });
    if (!bought) { sfx.bad(); return; }
    sfx.buy();
    bumpCounter("buy");
    log(`Comprou ${item.emoji} ${item.name}`, "good");
  }, [log, bumpCounter]);

  const useItem = useCallback((itemId: string) => {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return;
    let used = false;
    setState((s) => {
      const entry = s.inventory.find((i) => i.itemId === itemId);
      if (!entry || entry.quantity <= 0) return s;
      used = true;
      const pet: PetState = { ...s.pet };
      for (const [k, v] of Object.entries(item.effect)) {
        const key = k as keyof PetState;
        if (typeof v === "number" && typeof pet[key] === "number") {
          (pet[key] as number) = clamp((pet[key] as number) + v);
          triggerFlash(key as string, v > 0 ? "up" : "down");
        }
      }
      const inventory = item.consumable
        ? s.inventory
            .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0)
        : s.inventory;
      return { ...s, pet, inventory };
    });
    if (!used) return;
    sfx.use();
    gainXp(3);
    bumpCounter("useItem");
    log(`Usou ${item.emoji} ${item.name}`, "good");
  }, [gainXp, log, bumpCounter, triggerFlash]);

  const claimMission = useCallback((id: string) => {
    const def = DAILY_MISSIONS.find((m) => m.id === id);
    if (!def) return;
    let ok = false;
    setState((s) => {
      const m = s.missions.find((mm) => mm.id === id);
      if (!m || m.claimed || m.progress < def.goal) return s;
      ok = true;
      return {
        ...s,
        missions: s.missions.map((mm) => (mm.id === id ? { ...mm, claimed: true } : mm)),
        coins: s.coins + def.rewardCoins,
        pet: { ...s.pet, xp: s.pet.xp + def.rewardXp },
      };
    });
    if (ok) { sfx.mission(); log(`Missão concluída: ${def.name} (+${def.rewardCoins} 🪙 +${def.rewardXp} XP)`, "good"); }
  }, [log]);

  const resolveEvent = useCallback((choice: EventChoice) => {
    setState((s) => {
      if (!s.pendingEvent) return s;
      const pet: PetState = { ...s.pet };
      let coins = s.coins;
      for (const [k, v] of Object.entries(choice.effects)) {
        if (typeof v !== "number") continue;
        if (k === "coins") { coins = Math.max(0, coins + v); continue; }
        if (k === "xp") { pet.xp += v; continue; }
        const key = k as keyof PetState;
        if (typeof pet[key] === "number") {
          (pet[key] as number) = clamp((pet[key] as number) + v);
          triggerFlash(key as string, v > 0 ? "up" : "down");
        }
      }
      // levelup check
      const need = pet.level * 50;
      if (pet.xp >= need) { pet.xp -= need; pet.level += 1; }
      return { ...s, pet, coins, pendingEvent: null };
    });
    if (choice.kind === "bad") sfx.bad(); else if (choice.kind === "good") sfx.good(); else sfx.click();
    log(choice.resultText, choice.kind || "info");
  }, [log, triggerFlash]);

  const dismissEvent = useCallback(() => {
    setState((s) => ({ ...s, pendingEvent: null }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState());
    log("Jogo reiniciado", "info");
  }, [log]);

  const renamePet = useCallback((name: string) => {
    setState((s) => ({ ...s, pet: { ...s.pet, name } }));
  }, []);

  const exportSave = useCallback(() => {
    const data = JSON.stringify({ ...state, pendingEvent: null }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vida-realista-save-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    sfx.good();
    log("Save exportado!", "good");
  }, [state, log]);

  const importSave = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || typeof parsed !== "object" || !parsed.pet) throw new Error("invalid");
        const base = initialState();
        const merged: GameState = {
          ...base,
          ...parsed,
          pet: { ...base.pet, ...parsed.pet },
          unlockedAchievements: parsed.unlockedAchievements || [],
          missions: parsed.missions && parsed.missionsDay === today() ? parsed.missions : freshMissions(),
          missionsDay: today(),
          counters: parsed.missionsDay === today() ? { ...emptyCounters(), ...parsed.counters } : emptyCounters(),
          pendingEvent: null,
        };
        setState(merged);
        sfx.good();
        log("Save importado com sucesso!", "good");
      } catch {
        sfx.bad();
        log("Arquivo inválido", "bad");
      }
    };
    reader.readAsText(file);
  }, [log]);

  // Achievements
  useEffect(() => {
    if (!hydrated) return;
    setState((s) => {
      const newUnlocked: string[] = [];
      const unlockedAchievements = s.unlockedAchievements || [];
      const { pet, coins, inventory } = s;
      if (!unlockedAchievements.includes("rich") && coins >= 500) newUnlocked.push("rich");
      if (!unlockedAchievements.includes("level-5") && pet.level >= 5) newUnlocked.push("level-5");
      if (!unlockedAchievements.includes("level-10") && pet.level >= 10) newUnlocked.push("level-10");
      if (!unlockedAchievements.includes("level-15") && pet.level >= 15) newUnlocked.push("level-15");
      if (
        !unlockedAchievements.includes("full-stats") &&
        pet.hunger === 100 && pet.energy === 100 && pet.happiness === 100 && pet.hygiene === 100 && pet.health === 100
      ) newUnlocked.push("full-stats");
      if (!unlockedAchievements.includes("collector") && inventory.length >= 5) newUnlocked.push("collector");

      if (newUnlocked.length > 0) {
        sfx.good();
        const nextLog = [...s.log];
        newUnlocked.forEach((id) => {
          const name = ACHIEVEMENTS.find((a) => a.id === id)?.name || id;
          nextLog.unshift({ id: crypto.randomUUID(), text: `🏆 Conquista: ${name}!`, time: Date.now(), kind: "good" });
        });
        return { ...s, unlockedAchievements: [...unlockedAchievements, ...newUnlocked], log: nextLog.slice(0, 30) };
      }
      return s;
    });
  }, [hydrated, state.coins, state.pet.level, state.inventory.length, state.pet.hunger, state.pet.energy, state.pet.happiness, state.pet.hygiene, state.pet.health]);

  return {
    state,
    hydrated,
    popups: popupsRef.current,
    flashes: flashRef.current,
    setState,
    actions: { work, play, sleep, buyItem, useItem, reset, renamePet, addCoins, claimMission, resolveEvent, dismissEvent, exportSave, importSave },
  };
}
