import { create } from "zustand";

export type Interest = "COOKING" | "CHORES" | "PLANNING" | "GROCERIES" | "REMINDERS" | "ENCOURAGEMENT" | "EVERYTHING";
export type PersonalityStyle = "WARM" | "FUNNY" | "CALM" | "PRACTICAL";

interface OnboardingDraft {
  preferredName: string;
  interests: Interest[];
  personalityStyle: PersonalityStyle;
  setPreferredName: (v: string) => void;
  toggleInterest: (v: Interest) => void;
  setPersonalityStyle: (v: PersonalityStyle) => void;
}

export const useOnboardingStore = create<OnboardingDraft>((set, get) => ({
  preferredName: "",
  interests: [],
  personalityStyle: "WARM",
  setPreferredName: (v) => set({ preferredName: v }),
  toggleInterest: (v) => {
    if (v === "EVERYTHING") {
      set({ interests: get().interests.includes("EVERYTHING") ? [] : ["EVERYTHING"] });
      return;
    }
    const current = get().interests.filter((i) => i !== "EVERYTHING");
    set({ interests: current.includes(v) ? current.filter((i) => i !== v) : [...current, v] });
  },
  setPersonalityStyle: (v) => set({ personalityStyle: v }),
}));
