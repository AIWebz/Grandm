import { create } from "zustand";

interface AppState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  accountPromptVisible: boolean;
  accountPromptReason: string | null;
  requireFullAccount: (reason: string) => void;
  dismissAccountPrompt: () => void;
}

/** Small global UI state: connectivity banner + the "create an account" prompt sheet triggered by a 403 ACCOUNT_REQUIRED. */
export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  setOnline: (online) => set({ isOnline: online }),
  accountPromptVisible: false,
  accountPromptReason: null,
  requireFullAccount: (reason) => set({ accountPromptVisible: true, accountPromptReason: reason }),
  dismissAccountPrompt: () => set({ accountPromptVisible: false, accountPromptReason: null }),
}));
