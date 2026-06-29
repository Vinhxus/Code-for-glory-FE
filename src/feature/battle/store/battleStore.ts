import { create } from 'zustand';
import type { BattleField, BattleMode } from '../types/battle.types';

interface BattleStore {
  field: BattleField | null;
  mode: BattleMode | null;
  battleId: string | null;

  setBattleField: (field: BattleField) => void;
  setBattleMode: (mode: BattleMode) => void;
  setBattleId: (id: string) => void;
  resetBattle: () => void;
}

export const useBattleStore = create<BattleStore>((set) => ({
  field: null,
  mode: null,
  battleId: null,

  setBattleField: (field) => set({ field }),
  setBattleMode: (mode) => set({ mode }),
  setBattleId: (id) => set({ battleId: id }),
  resetBattle: () => set({ field: null, mode: null, battleId: null }),
}));
