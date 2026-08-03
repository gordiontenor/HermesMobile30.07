import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { ScreenShell } from "../src/components/ScreenShell";
import { Header } from "../src/components/Header";
import { HermesCard } from "../src/components/HermesCard";
import { StatusPill } from "../src/components/StatusPill";
import { darkTheme } from "../src/theme/theme";
import { useGatewayPersistence } from "../src/hooks/useGatewayPersistence";
import { useSettingsPersistence } from "../src/hooks/useSettingsPersistence";
import { sendLiveNoToolsChatMessage } from "../src/api/hermesLiveChatTransport";
import {
  getFriendlyChatErrorMessage,
  getFriendlyChatStatusMessage,
} from "../src/utils/hermesChatErrorMessages";
import type { HermesGatewaySetupConfig } from "../src/viewModels/hermesGatewaySetupViewModel";

const GATEWAY_URL_KEY = "@hermes/gatewayUrl";
const SELECTED_PROVIDER_KEY = "@hermes/selectedProvider";
const SELECTED_MODEL_KEY = "@hermes/selectedModel";
const SAFE_MODE_KEY = "@hermes/safeMode";
const DEMO_MODE_KEY = "@hermes/demoMode";
const CHAT_HISTORY_KEY = "@hermes/chatHistory";

const DEMO_PROVIDER = "opencode-go";
const DEMO_MODEL = "kimi-k2.5";

type LoadState = "loading" | "no_gateway" | "no_provider" | "ready";

type Message = {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  isError?: boolean;
};

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Phase-shifted blink schedule for each typing dot. All dots are driven by a
// single 0 → 1 clock value; each dot interpolates it with its own offset
// (0 / 0.33 / 0.66) so the blinks cascade left → right.
const TYPING_DOT_PHASES: readonly {
  inputRange: number[];
  outputRange: number[];
}[] = [
  // offset 0: brightens first, then dims
  { inputRange: [0, 0.2, 0.4, 1], outputRange: [0.2, 1, 0.2, 0.2] },
  // offset 0.33
  { inputRange: [0, 0.33, 0.53, 0.73, 1], outputRange: [0.2, 0.2, 1, 0.2, 0.2] },
  // offset 0.66: brightens last
  { inputRange: [0, 0.66, 0.86, 1], outputRange: [0.2, 0.2, 1, 0.2] },
];

// Three-dot "typing" indicator shown while a reply is being generated.
// Rendered as an assistant-style bubble so it sits on the left side.
function TypingBubble() {
  // Single shared clock (0 → 1, looped); each dot derives its own staggered
  // blink from it via interpolation phases.
  const clock = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animated.loop resets the value to 0 after each pass, giving a
    // continuous sawtooth clock. The loop is stopped on unmount so no
    // animation leaks after leaving the screen.
    const animation = Animated.loop(
      Animated.timing(clock, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [clock]);

  return (
    <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
      {TYPING_DOT_PHASES.map((phase, index) => (
        <Animated.View
          key={index}
          style={[styles.typingDot, { opacity: clock.interpolate(phase) }]}
        />
      ))}
    </View>
  );
}

export default function ChatRoute() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [gatewayUrl, setGatewayUrl] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [safeMode, setSafeMode] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const { username, password } = useGatewayPersistence();
  const { streamingEnabled } = useSettingsPersistence();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.multiGet([
          GATEWAY_URL_KEY,
          SELECTED_PROVIDER_KEY,
          SELECTED_MODEL_KEY,
          SAFE_MODE_KEY,
        ]);
        const gw = stored[0][1] ?? "";
        const prov = stored[1][1] ?? "";
        const mdl = stored[2][1] ?? "";
        const sm = stored[3][1] === "true";

        setGatewayUrl(gw);
        setProvider(prov);
        setModel(mdl);
        setSafeMode(sm);

        if (!gw) {
          setLoadState("no_gateway");
        } else if (!prov || !mdl) {
          setLoadState("no_provider");
        } else {
          setLoadState("ready");
        }
      } catch {
        setLoadState("no_gateway");
      }
    })();
  }, []);

  // Restore persisted chat history on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
        if (!raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        const restored: Message[] = parsed
          .filter(
            (m): m is { role: string; text: string; timestamp?: unknown } =>
              typeof m === "object" &&
              m !== null &&
              typeof (m as { role?: unknown }).role === "string" &&
              ((m as { role?: unknown }).role === "user" ||
                (m as { role?: unknown }).role === "assistant") &&
              typeof (m as { text?: unknown }).text === "string"
          )
          .map((m) => {
            const ts = m.timestamp ? new Date(String(m.timestamp)) : new Date();
            return {
              role: m.role === "user" ? ("user" as const) : ("assistant" as const),
              text: m.text,
              timestamp: Number.isNaN(ts.getTime()) ? new Date() : ts,
            };
          });
        if (restored.length > 0) {
          setMessages(restored);
        }
      } catch {
        // silently ignore corrupted history
      }
    })();
  }, []);

  const handleStartDemo = async () => {
    try {
      await AsyncStorage.multiSet([
        [SELECTED_PROVIDER_KEY, DEMO_PROVIDER],
        [SELECTED_MODEL_KEY, DEMO_MODEL],
        [DEMO_MODE_KEY, "true"],
      ]);
    } catch {
      // silently fail
    }
    setGatewayUrl("demo://local");
    setProvider(DEMO_PROVIDER);
    setModel(DEMO_MODEL);
    setIsDemo(true);
    setLoadState("ready");
  };

  // Auto-scroll to bottom when messages change or the typing indicator
  // appears/disappears, so the newest bubble stays in view.
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isSending]);

  // Append a message to state and persist the updated history
  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      const next = [...prev, msg];
      AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(next)).catch(() => {
        // silently ignore storage errors
      });
      return next;
    });
  }, []);

  const handleCopyMessage = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Kopyalandı", "Mesaj panoya kopyalandı.");
    } catch {
      Alert.alert("Kopyalama başarısız", "Mesaj panoya kopyalanamadı.");
    }
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    // Add user message bubble
    const userMsg: Message = { role: "user", text, timestamp: new Date() };
    appendMessage(userMsg);
    setInputText("");
    setIsSending(true);
    setStreamingText("");
    setIsStreaming(false);

    try {
      if (isDemo) {
        // Simulate a short delay for demo mode
        await new Promise((r) => setTimeout(r, 800));
        const demoReply: Message = {
          role: "assistant",
          text: "Bu bir demo yanıtıdır. Gerçek AI yanıtları için gateway'e bağlan.",
          timestamp: new Date(),
        };
        appendMessage(demoReply);
      } else {
        const config: HermesGatewaySetupConfig = {
          url: gatewayUrl,
          username,
          password,
          isDirty: true,
        };

        // Get API key for the selected provider
        let apiKey: string | undefined;
        let providerKeyLabel: string | null = null;
        if (provider === "deepseek") {
          apiKey = (await AsyncStorage.getItem("@hermes/apiKey_deepseek")) || undefined;
          providerKeyLabel = "DeepSeek";
        } else if (provider === "opencode-go" || provider === "opencode") {
          apiKey = (await AsyncStorage.getItem("@hermes/apiKey_opencode")) || undefined;
          providerKeyLabel = "OpenCode Go";
        } else if (provider === "openrouter") {
          apiKey = (await AsyncStorage.getItem("@hermes/apiKey_openrouter")) || undefined;
          providerKeyLabel = "OpenRouter";
        }

        // Pre-send guard: provider needs an API key but none is stored.
        if (providerKeyLabel && !apiKey) {
          appendMessage({
            role: "assistant",
            text: `${providerKeyLabel} API key'i girilmemiş. Ayarlar'dan API key'ini ekleyip tekrar dene.`,
            timestamp: new Date(),
            isError: true,
          });
          setIsSending(false);
          return;
        }

        const response = await sendLiveNoToolsChatMessage(
          config,
          { message: text, apiKey, model, provider },
          null,
          streamingEnabled
            ? (delta) => {
                setIsStreaming(true);
                setStreamingText((previous) => previous + delta);
              }
            : undefined,
        );

        if (response.status === "ok") {
          const assistantMsg: Message = {
            role: "assistant",
            text: response.text,
            timestamp: new Date(),
          };
          appendMessage(assistantMsg);
        } else {
          const errorMsg: Message = {
            role: "assistant",
            text: getFriendlyChatStatusMessage(response.status, response.safeError),
            timestamp: new Date(),
            isError: true,
          };
          appendMessage(errorMsg);
        }
      }
    } catch (err: unknown) {
      const errorText = getFriendlyChatErrorMessage(
        err,
        "Mesaj gönderilemedi. Tekrar dene."
      );
      appendMessage({
        role: "assistant",
        text: errorText,
        timestamp: new Date(),
        isError: true,
      });
    } finally {
      setIsSending(false);
      setIsStreaming(false);
      setStreamingText("");
    }
  }, [inputText, isSending, isDemo, gatewayUrl, username, password, appendMessage, model, provider, streamingEnabled]);

  if (loadState === "loading") {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={darkTheme.primary} />
        </View>
      </ScreenShell>
    );
  }

  if (loadState === "no_gateway") {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <HermesCard title="Gateway Yapılandırılmamış">
            <Text style={styles.infoText}>
              Sohbeti kullanmadan önce Ayarlar&apos;dan gateway&apos;ini yapılandır.
            </Text>
          </HermesCard>
          <Link href="/settings" asChild>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Ayarlar&apos;a Git</Text>
            </Pressable>
          </Link>
          <Pressable style={styles.demoButton} onPress={handleStartDemo}>
            <Text style={styles.demoButtonText}>Demo Modunda Devam Et</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  if (loadState === "no_provider") {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <HermesCard title="Provider Seçilmedi">
            <Text style={styles.infoText}>
              Sohbete başlamak için bir provider ve model seç.
            </Text>
          </HermesCard>
          <Link href="/providers" asChild>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Provider Seç</Text>
            </Pressable>
          </Link>
          <Pressable style={styles.demoButton} onPress={handleStartDemo}>
            <Text style={styles.demoButtonText}>Demo Modunda Devam Et</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell safeMode={safeMode}>
      {/* Custom header with chat icon */}
      <Header
        title="Chat"
        showBack
        showSettings
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.container}>
          {/* Connection info card */}
          <HermesCard title={isDemo ? "Bağlı (Demo Modu)" : "Bağlı"}>
            <View style={styles.compactStatusRow}>
              <View style={[styles.statusDot, { backgroundColor: isDemo ? darkTheme.accent : darkTheme.success }]} />
              <Text style={styles.compactStatusText} numberOfLines={1}>
                Provider: {provider} • Model: {model}
              </Text>
              {safeMode && (
                <StatusPill label="Safe Mode" color={darkTheme.accent} />
              )}
              {isDemo && (
                <StatusPill label="Demo Modu" color={darkTheme.accent} />
              )}
              <Pressable
                style={styles.clearButton}
                onPress={() =>
                  Alert.alert(
                    "Sohbeti Temizle",
                    "Tüm mesajlar silinecek. Emin misin?",
                    [
                      { text: "İptal", style: "cancel" },
                      {
                        text: "Temizle",
                        style: "destructive",
                        onPress: () => {
                          setMessages([]);
                          AsyncStorage.removeItem(CHAT_HISTORY_KEY).catch(() => {});
                        },
                      },
                    ],
                  )
                }
              >
                <Ionicons name="trash-outline" size={16} color={darkTheme.error} />
                <Text style={styles.clearButtonText}>Temizle</Text>
              </Pressable>
            </View>
          </HermesCard>

          {/* Messages area */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesArea}
            contentContainerStyle={
              messages.length === 0 ? styles.messagesContentEmpty : styles.messagesContent
            }
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbox-ellipses-outline"
                  size={40}
                  color={darkTheme.textSecondary}
                  style={{ marginBottom: 12, opacity: 0.4 }}
                />
                <Text style={styles.emptyText}>
                  Henüz mesaj yok. İlk mesajını yaz!
                </Text>
              </View>
            ) : (
              messages.map((msg, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.bubble,
                    msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                  onLongPress={() => handleCopyMessage(msg.text)}
                  delayLongPress={350}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      msg.role === "user"
                        ? styles.bubbleTextUser
                        : msg.isError
                          ? styles.bubbleTextError
                          : styles.bubbleTextAssistant,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.timestamp,
                      msg.role === "user"
                        ? styles.timestampUser
                        : styles.timestampAssistant,
                    ]}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                </Pressable>
              ))
            )}

            {isStreaming && (
              <View style={[styles.bubble, styles.streamingBubble]}>
                <Text style={styles.bubbleTextAssistant}>{streamingText}</Text>
              </View>
            )}

            {/* Typing indicator (three-dot animation while waiting for a reply) */}
            {isSending && !isStreaming && <TypingBubble />}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="chatbox-outline"
                size={18}
                color={darkTheme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={darkTheme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline={false}
                editable={!isSending}
              />
            </View>
            <Pressable
              style={[
                styles.sendButton,
                (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              disabled={!inputText.trim() || isSending}
              onPress={handleSend}
            >
              <Ionicons
                name="send"
                size={18}
                color={!inputText.trim() || isSending ? darkTheme.textSecondary : "#FFF"}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  infoText: {
    color: darkTheme.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  compactStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactStatusText: {
    color: darkTheme.text,
    fontSize: 13,
    flexShrink: 1,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  clearButtonText: {
    color: darkTheme.error,
    fontSize: 12,
    fontWeight: "600",
  },
  messagesArea: {
    flex: 1,
    marginVertical: 8,
  },
  messagesContentEmpty: {
    flexGrow: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: darkTheme.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  // --- Message bubbles ---
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 4,
  },
  bubbleUser: {
    backgroundColor: darkTheme.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: darkTheme.surface,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  streamingBubble: {
    backgroundColor: "#2D2D2D",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: "#FFFFFF",
  },
  bubbleTextAssistant: {
    color: darkTheme.text,
  },
  bubbleTextError: {
    color: "#F28B82",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  timestampUser: {
    color: "rgba(255,255,255,0.6)",
  },
  timestampAssistant: {
    color: darkTheme.textSecondary,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 14,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: darkTheme.text,
  },
  // --- Input bar ---
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: darkTheme.border,
    backgroundColor: darkTheme.background,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: darkTheme.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: darkTheme.border,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: darkTheme.text,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: darkTheme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: darkTheme.surface,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  actionButton: {
    backgroundColor: darkTheme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  demoButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: darkTheme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 12,
  },
  demoButtonText: {
    color: darkTheme.primary,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
