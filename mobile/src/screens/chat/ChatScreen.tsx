import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { MainTabParamList } from "../../navigation/types";
import { streamChatMessage, ToolInvocation } from "../../api/chatStream";
import { GrandmaAvatar } from "../../components/GrandmaAvatar";
import { ToolInvocationCard } from "../../components/ToolInvocationCard";
import { useChatUsage } from "../../hooks/useChatUsage";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { colors, typography, spacing, radii, MIN_TOUCH_TARGET } from "../../theme/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolInvocations?: ToolInvocation[];
  streaming?: boolean;
  isError?: boolean;
}

const QUICK_PROMPTS = ["What's for dinner?", "Plan my day", "Give me something to clean", "Make a grocery list", "Help me cook"];

let idCounter = 0;
const nextId = () => `msg_${idCounter++}_${Date.now()}`;

export function ChatScreen() {
  const route = useRoute<RouteProp<MainTabParamList, "GrandmaTab">>();
  const [messages, setMessages] = useState<Message[]>([
    { id: nextId(), role: "assistant", text: "Hi sweetheart, what can I help you with today?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);
  const listRef = useRef<FlatList<Message>>(null);
  const cancelRef = useRef<(() => void) | null>(null);
  const { data: usage } = useChatUsage(usageRefreshKey);
  const { isListening, available: voiceAvailable, start: startListening, stop: stopListening } = useVoiceInput((text) =>
    setInput((prev) => (prev ? `${prev} ${text}` : text))
  );

  useEffect(() => {
    const prefilled = route.params?.prefilledIntent;
    if (prefilled) send(prefilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.prefilledIntent]);

  useEffect(() => () => cancelRef.current?.(), []);

  const history = () => messages.filter((m) => !m.streaming).map((m) => ({ role: m.role, content: m.text }));

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    if (usage?.atCap) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text: trimmed },
        {
          id: nextId(),
          role: "assistant",
          text: "You've used up today's free chats with me, sweetheart. Grandma+ gives you unlimited conversations any time.",
          isError: true,
        },
      ]);
      setInput("");
      return;
    }

    const userMsg: Message = { id: nextId(), role: "user", text: trimmed };
    const assistantId = nextId();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", text: "", streaming: true }]);
    setInput("");
    setSending(true);

    cancelRef.current = streamChatMessage(trimmed, history(), {
      onDelta: (delta) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: m.text + delta } : m)));
      },
      onDone: ({ text, toolInvocations }) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text, toolInvocations, streaming: false } : m)));
        setSending(false);
        setUsageRefreshKey((k) => k + 1);
        if (ttsEnabled && text) Speech.speak(text);
      },
      onError: (message) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, text: message, streaming: false, isError: true } : m)));
        setSending(false);
      },
    });
  };

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GrandmaAvatar size={36} />
        <Text style={[typography.subtitle, { marginLeft: spacing.sm }]}>Grandma</Text>
        <Pressable
          onPress={() => setTtsEnabled((v) => !v)}
          style={styles.ttsToggle}
          accessibilityRole="switch"
          accessibilityState={{ checked: ttsEnabled }}
          accessibilityLabel="Read replies aloud"
        >
          <Text style={typography.caption}>{ttsEnabled ? "🔊 Voice on" : "🔈 Voice off"}</Text>
        </Pressable>
      </View>

      {usage && !usage.unlimited && (
        <Text style={styles.usageText} accessibilityLabel={`${usage.remaining} of ${usage.cap} free Grandma chats left today`}>
          {usage.remaining} of {usage.cap} free chats left today
        </Text>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => (
            <View style={[styles.bubbleRow, item.role === "user" && styles.bubbleRowUser]}>
              <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.assistantBubble, item.isError && styles.errorBubble]}>
                <Text style={[typography.body, item.role === "user" && { color: "#fff" }]}>{item.text || "…"}</Text>
              </View>
              {item.toolInvocations?.map((inv, i) => (
                <ToolInvocationCard key={i} invocation={inv} />
              ))}
            </View>
          )}
        />

        {messages.length <= 2 && (
          <FlatList
            data={QUICK_PROMPTS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p}
            contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}
            renderItem={({ item }) => (
              <Pressable onPress={() => send(item)} style={styles.chip} accessibilityRole="button" accessibilityLabel={item}>
                <Text style={typography.caption}>{item}</Text>
              </Pressable>
            )}
          />
        )}

        <View style={styles.inputRow}>
          {voiceAvailable && (
            <Pressable
              onPress={isListening ? stopListening : startListening}
              style={[styles.micButton, isListening && styles.micButtonActive]}
              accessibilityRole="button"
              accessibilityLabel={isListening ? "Stop voice input" : "Start voice input"}
            >
              <Text>{isListening ? "🎙️" : "🎤"}</Text>
            </Pressable>
          )}
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Grandma anything..."
            placeholderTextColor={colors.brownMuted}
            accessibilityLabel="Message to Grandma"
            multiline
          />
          <Pressable
            onPress={() => send(input)}
            disabled={!input.trim() || sending}
            style={[styles.sendButton, (!input.trim() || sending) && { opacity: 0.5 }]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  ttsToggle: { marginLeft: "auto", minHeight: MIN_TOUCH_TARGET, justifyContent: "center", paddingHorizontal: spacing.sm },
  usageText: { textAlign: "center", color: colors.brownMuted, fontSize: 12, paddingVertical: 4 },
  messages: { padding: spacing.md },
  bubbleRow: { marginBottom: spacing.sm, maxWidth: "85%" },
  bubbleRowUser: { alignSelf: "flex-end" },
  bubble: { padding: spacing.md, borderRadius: radii.md },
  assistantBubble: { backgroundColor: colors.card, borderTopLeftRadius: 4 },
  userBubble: { backgroundColor: colors.coral, borderTopRightRadius: 4 },
  errorBubble: { backgroundColor: "#FBE9E7" },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cream,
  },
  micButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
  },
  micButtonActive: { backgroundColor: "#FDEEEB" },
  input: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    maxHeight: 120,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    color: colors.brownText,
  },
  sendButton: {
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
});
