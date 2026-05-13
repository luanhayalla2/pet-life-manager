import { InventoryEntry, SHOP_ITEMS } from "@/lib/game-types";

interface Props {
  inventory: InventoryEntry[];
  onUse: (id: string) => void;
}

export function Inventory({ inventory, onUse }: Props) {
  return (
    <div className="hud-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neon-green">🎒 Inventário</h2>
        <span className="text-xs text-muted-foreground">{inventory.reduce((s, i) => s + i.quantity, 0)} itens</span>
      </div>
      {inventory.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          Vazio. Compre algo na loja 👇
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {inventory.map((entry) => {
            const item = SHOP_ITEMS.find((i) => i.id === entry.itemId);
            if (!item) return null;
            return (
              <button
                key={entry.itemId}
                type="button"
                onClick={() => onUse(entry.itemId)}
                className="relative flex flex-col items-center gap-1 rounded-lg border border-border bg-card/50 p-2 transition hover:border-neon-green hover:bg-card"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[10px] font-medium">{item.name}</span>
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.55_0.22_305)] text-[10px] font-bold text-white">
                  {entry.quantity}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}