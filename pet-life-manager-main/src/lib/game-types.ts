export type PetMood = "happy" | "ok" | "sad" | "sleeping";

export interface PetState {
  name: string;
  level: number;
  xp: number;
  hunger: number; // 0-100 (100 = cheio)
  energy: number; // 0-100
  happiness: number; // 0-100
  hygiene: number; // 0-100
  health: number; // 0-100
  isSleeping: boolean;
  lastTick: number;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  type: "food" | "toy" | "care" | "boost";
  description: string;
  effect: Partial<Pick<PetState, "hunger" | "energy" | "happiness" | "hygiene" | "health">>;
  consumable: boolean;
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export type MissionMetric = "work" | "play" | "buy" | "useItem" | "coinsEarned" | "sleep";

export interface Mission {
  id: string;
  name: string;
  description: string;
  emoji: string;
  metric: MissionMetric;
  goal: number;
  rewardCoins: number;
  rewardXp: number;
}

export interface MissionProgress {
  id: string;
  progress: number;
  claimed: boolean;
}

export interface EventChoice {
  label: string;
  emoji?: string;
  effects: Partial<Pick<PetState, "hunger" | "energy" | "happiness" | "hygiene" | "health">> & {
    coins?: number;
    xp?: number;
  };
  resultText: string;
  kind?: "good" | "bad" | "info";
}

export interface RandomEvent {
  id: string;
  emoji: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: (state: GameState) => boolean;
}

export interface GameState {
  pet: PetState;
  coins: number;
  inventory: InventoryEntry[];
  log: { id: string; text: string; time: number; kind: "info" | "good" | "bad" }[];
  unlockedAchievements: string[];
  missions: MissionProgress[];
  missionsDay: string; // YYYY-MM-DD
  counters: Record<MissionMetric, number>;
  pendingEvent: RandomEvent | null;
}

export const ACHIEVEMENTS: Omit<Achievement, "condition">[] = [
  { id: "rich", name: "Capitalista", description: "Acumule 500 moedas", emoji: "💰" },
  { id: "level-5", name: "Crescidinho", description: "Alcance o nível 5", emoji: "📈" },
  { id: "level-10", name: "Veterano", description: "Alcance o nível 10", emoji: "👑" },
  { id: "level-15", name: "Ancião", description: "Alcance o nível 15", emoji: "📜" },
  { id: "full-stats", name: "Pet Perfeito", description: "Todos os status em 100%", emoji: "✨" },
  { id: "collector", name: "Colecionador", description: "Tenha 5 itens diferentes no inventário", emoji: "🎒" },
];

export const DAILY_MISSIONS: Mission[] = [
  { id: "work-3", name: "Mãos à obra", description: "Trabalhe 3 vezes", emoji: "💼", metric: "work", goal: 3, rewardCoins: 30, rewardXp: 15 },
  { id: "play-2", name: "Diversão garantida", description: "Brinque 2 vezes com o pet", emoji: "🎮", metric: "play", goal: 2, rewardCoins: 20, rewardXp: 10 },
  { id: "buy-1", name: "Cliente do dia", description: "Compre 1 item na loja", emoji: "🛍️", metric: "buy", goal: 1, rewardCoins: 15, rewardXp: 8 },
  { id: "use-2", name: "Cuidado em dia", description: "Use 2 itens do inventário", emoji: "🎒", metric: "useItem", goal: 2, rewardCoins: 25, rewardXp: 12 },
  { id: "earn-50", name: "Acumulador", description: "Ganhe 50 moedas no total", emoji: "🪙", metric: "coinsEarned", goal: 50, rewardCoins: 40, rewardXp: 20 },
];

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: "stray-coin",
    emoji: "🪙",
    title: "Moeda na rua",
    description: "Você encontrou uma moeda brilhante no chão. O que faz?",
    choices: [
      { label: "Pegar", emoji: "✋", effects: { coins: 20 }, resultText: "Pegou +20 moedas!", kind: "good" },
      { label: "Ignorar", emoji: "🚶", effects: { happiness: -3 }, resultText: "Seguiu em frente.", kind: "info" },
    ],
  },
  {
    id: "fast-food",
    emoji: "🍔",
    title: "Tentação fast food",
    description: "Passou na frente de uma lanchonete. Cheirinho irresistível!",
    choices: [
      { label: "Comprar lanche", emoji: "🍔", effects: { coins: -15, hunger: 30, happiness: 10, health: -5 }, resultText: "Comeu rápido. Gostoso, mas não saudável.", kind: "info" },
      { label: "Resistir", emoji: "💪", effects: { happiness: -5, xp: 5 }, resultText: "Disciplina! Ganhou XP de força de vontade.", kind: "good" },
    ],
  },
  {
    id: "rain",
    emoji: "🌧️",
    title: "Chuva forte",
    description: "Começou a chover do nada e seu pet ficou preocupado.",
    choices: [
      { label: "Abraçar o pet", emoji: "🤗", effects: { happiness: 20, energy: -5 }, resultText: "O pet se acalmou no seu colo.", kind: "good" },
      { label: "Sair correndo", emoji: "🏃", effects: { hygiene: -25, energy: -10 }, resultText: "Chegou em casa todo molhado.", kind: "bad" },
    ],
  },
  {
    id: "friend-visit",
    emoji: "🎉",
    title: "Amigo apareceu",
    description: "Um amigo bateu na porta convidando pra sair.",
    choices: [
      { label: "Aceitar", emoji: "🥳", effects: { happiness: 25, energy: -15, coins: -10 }, resultText: "Foi se divertir!", kind: "good" },
      { label: "Recusar", emoji: "😴", effects: { energy: 10, happiness: -10 }, resultText: "Ficou em casa descansando.", kind: "info" },
    ],
  },
  {
    id: "gift",
    emoji: "🎁",
    title: "Presente misterioso",
    description: "Apareceu um pacote na sua porta, sem remetente.",
    choices: [
      { label: "Abrir", emoji: "📦", effects: { coins: 35, xp: 10 }, resultText: "Era cheio de moedas!", kind: "good" },
      { label: "Devolver", emoji: "↩️", effects: { happiness: 5 }, resultText: "Honestidade acima de tudo.", kind: "info" },
    ],
  },
  {
    id: "nightmare",
    emoji: "👻",
    title: "Pesadelo",
    description: "Seu pet acordou assustado no meio da noite.",
    choices: [
      { label: "Confortar", emoji: "❤️", effects: { happiness: 15, energy: -10 }, resultText: "Ele dormiu tranquilo de novo.", kind: "good" },
      { label: "Ignorar", emoji: "🙉", effects: { happiness: -20, health: -5 }, resultText: "Ele ficou triste.", kind: "bad" },
    ],
  },
  {
    id: "training",
    emoji: "🏋️",
    title: "Sessão de treino",
    description: "Que tal um exercício rápido com o pet?",
    choices: [
      { label: "Treinar", emoji: "💪", effects: { energy: -20, happiness: 10, xp: 15 }, resultText: "Treino completo! +15 XP", kind: "good" },
      { label: "Pular", emoji: "❌", effects: {}, resultText: "Fica pra próxima.", kind: "info" },
    ],
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: "apple", name: "Maçã", emoji: "🍎", price: 8, type: "food", description: "+20 fome", effect: { hunger: 20 }, consumable: true },
  { id: "steak", name: "Bife Premium", emoji: "🥩", price: 25, type: "food", description: "+50 fome, +5 saúde", effect: { hunger: 50, health: 5 }, consumable: true },
  { id: "cake", name: "Bolo", emoji: "🎂", price: 15, type: "food", description: "+25 fome, +15 felicidade", effect: { hunger: 25, happiness: 15 }, consumable: true },
  { id: "ball", name: "Bolinha", emoji: "🎾", price: 20, type: "toy", description: "+30 felicidade", effect: { happiness: 30 }, consumable: false },
  { id: "console", name: "Console", emoji: "🎮", price: 80, type: "toy", description: "+60 felicidade", effect: { happiness: 60 }, consumable: false },
  { id: "shower", name: "Banho", emoji: "🛁", price: 12, type: "care", description: "+50 higiene", effect: { hygiene: 50 }, consumable: true },
  { id: "potion", name: "Poção de Energia", emoji: "⚡", price: 30, type: "boost", description: "+50 energia", effect: { energy: 50 }, consumable: true },
  { id: "medkit", name: "Kit Médico", emoji: "💊", price: 45, type: "care", description: "+60 saúde", effect: { health: 60 }, consumable: true },
];