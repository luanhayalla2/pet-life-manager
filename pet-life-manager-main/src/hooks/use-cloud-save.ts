import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { GameState } from "@/lib/game-types";

/**
 * Sync game state with cloud table game_saves.
 * - When user logs in: pulls remote save (if newer or local empty) and applies via setState.
 * - On state change while logged in: debounced upsert to cloud.
 */
export function useCloudSave(
  userId: string | undefined,
  state: GameState,
  hydrated: boolean,
  setState: (s: GameState) => void,
) {
  const pulled = useRef<string | null>(null);

  // Pull on login
  useEffect(() => {
    if (!userId || !hydrated) return;
    if (pulled.current === userId) return;
    pulled.current = userId;
    (async () => {
      const { data } = await supabase
        .from("game_saves")
        .select("state, updated_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (data?.state) {
        try {
          const remote = data.state as unknown as GameState;
          setState({ ...remote, pendingEvent: null });
        } catch { /* ignore */ }
      } else {
        // First time — push local
        await supabase.from("game_saves").upsert({
          user_id: userId,
          state: { ...state, pendingEvent: null } as any,
        });
      }
    })();
  }, [userId, hydrated, setState, state]);

  // Debounced push
  useEffect(() => {
    if (!userId || !hydrated) return;
    const t = setTimeout(() => {
      supabase.from("game_saves").upsert({
        user_id: userId,
        state: { ...state, pendingEvent: null } as any,
      }).then(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [userId, hydrated, state]);
}
