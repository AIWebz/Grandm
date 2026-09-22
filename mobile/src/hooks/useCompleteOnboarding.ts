import { useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../state/authStore";
import { useOnboardingStore } from "../state/onboardingStore";

/**
 * Onboarding is skippable after screen 1 (Section 2) - this submits
 * whatever fields have been filled so far and marks onboarding complete,
 * so the user drops into the app rather than being blocked.
 */
export function useCompleteOnboarding() {
  const [submitting, setSubmitting] = useState(false);
  const refreshMe = useAuthStore((s) => s.refreshMe);
  const { preferredName, interests, personalityStyle } = useOnboardingStore();

  const complete = async () => {
    setSubmitting(true);
    try {
      await api.patch("/users/me", {
        preferredName: preferredName || undefined,
        interests: interests.length ? interests : undefined,
        personalityStyle,
        onboardingCompleted: true,
      });
      await refreshMe();
    } finally {
      setSubmitting(false);
    }
  };

  return { complete, submitting };
}
