import { useCallback, useEffect, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

/**
 * On-device speech-to-text for the chat mic button (Section 4). Needs a
 * custom dev client / EAS build - Expo Go doesn't include third-party
 * native modules, so this degrades to "unavailable" there rather than
 * crashing (see docs/ARCHITECTURE.md).
 */
export function useVoiceInput(onFinalTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [available, setAvailable] = useState(true);
  const latestTranscript = useRef("");

  useEffect(() => {
    ExpoSpeechRecognitionModule.getStateAsync?.().catch(() => setAvailable(false));
  }, []);

  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    if (latestTranscript.current.trim()) onFinalTranscript(latestTranscript.current.trim());
    latestTranscript.current = "";
  });
  useSpeechRecognitionEvent("result", (event) => {
    latestTranscript.current = event.results[0]?.transcript ?? "";
  });
  useSpeechRecognitionEvent("error", () => setIsListening(false));

  const start = useCallback(async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        setAvailable(false);
        return;
      }
      ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, continuous: false });
    } catch {
      setAvailable(false);
    }
  }, []);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { isListening, available, start, stop };
}
