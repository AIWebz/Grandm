import { useCallback } from "react";

/**
 * Web build of useVoiceInput.ts. expo-speech-recognition is a native-only
 * module, so this never imports it - browsers have their own (inconsistent)
 * speech APIs, out of scope here. The mic button hides itself when
 * `available` is false, same as an Expo Go preview.
 */
export function useVoiceInput(_onFinalTranscript: (text: string) => void) {
  const start = useCallback(async () => {}, []);
  const stop = useCallback(() => {}, []);

  return { isListening: false, available: false, start, stop };
}
