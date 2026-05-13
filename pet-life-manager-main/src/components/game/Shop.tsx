import { SHOP_ITEMS, ShopItem } from "@/lib/game-types";
import { cn } from "@/lib/utils";

interface Props {
  coins: number;
  onBuy: (item: ShopItem) => void;
}

const typeColor: Record<ShopItem["type"], string> = {
  food: "border-[oklch(0.7_0.2_145/0.4)] hover:border-[oklch(0.7_0.2_145)]",
  toy: "border-[oklch(0.55_0.22_305/0.4)] hover:border-[oklch(0.55_0.22_305)]",
  care: "border-[oklch(0.65_0.18_245/0.4)] hover:border-[oklch(0.65_0.18_245)]",
  boost: "border-[oklch(0.85_0.17_90/0.4)] hover:border-[oklch(0.85_0.17_90)]",
};

export function Shop({ coins, onBuy }: Props) {
  return (
    <div className="hud-panel rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neon-blue">🏪 Loja</h2>
        <span className="text-xs text-muted-foreground">Compre itens pro seu pet</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SHOP_ITEMS.map((item) => {
          const canBuy = coins >= item.price;
          return (
            <button
              key={item.id}
              type="button"
              disabled={!canBuy}
              onClick={() => onBuy(item)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-xl border bg-card/40 p-3 text-center transition-all",
                typeColor[item.type],
                canBuy ? "hover:-translate-y-0.5 hover:bg-card/70" : "opacity-40 grayscale cursor-not-allowed"
              )}
            >
              <span className="text-3xl drop-shadow">{item.emoji}</span>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold">{item.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
              </div>
              <span
                className={cn(
                  "mt-auto rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                  canBuy ? "bg-[oklch(0.85_0.17_90/0.15)] text-neon-yellow" : "bg-muted text-muted-foreground"
                )}
              >
                🪙 {item.price}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}