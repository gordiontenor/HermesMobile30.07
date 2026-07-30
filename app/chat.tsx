import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenShell } from "../src/components/ScreenShell";
import { HermesCard } from "../src/components/HermesCard";
import { StatusPill } from "../src/components/StatusPill";
import { darkTheme } from "../src/theme/theme";
import { useGatewayPersistence } from "../src/hooks/useGatewayPersistence";
import { sendLiveNoToolsChatMessage } from "../src/api/hermesLiveChatTransport";
import type { HermesGatewaySetupConfig } from "../src/viewModels/hermesGatewaySetupViewModel";

const GATEWAY_URL_KEY = "@hermes/gatewayUrl";
const SELECTED_PROVIDER_KEY = "@hermes/selectedProvider";
const SELECTED_MODEL_KEY = "@hermes/selectedModel";
const SAFE_MODE_KEY = "@hermes/safeMode";
const DEMO_MODE_KEY = "@hermes/demoMode";

const DEMO_PROVIDER = "openai-codex";
const DEMO_MODEL = "gpt-4o";

type LoadState = "loading" | "no_gateway" | "no_provider" | "ready";

type Message = {
  role: "user" | "assistant";
  text: string;
};

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

  const { username, password } = useGatewayPersistence();
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    // Add user message bubble
    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);

    try {
      if (isDemo) {
        // Simulate a short delay for demo mode
        await new Promise((r) => setTimeout(r, 800));
        const demoReply: Message = {
          role: "assistant",
          text: "This is a demo response. Connect to a real gateway for actual AI responses.",
        };
        setMessages((prev) => [...prev, demoReply]);
      } else {
        const config: HermesGatewaySetupConfig = {
          url: gatewayUrl,
          username,
          password,
          isDirty: true,
        };

        const response = await sendLiveNoToolsChatMessage(config, { text });

        if (response.status === "ok") {
          const assistantMsg: Message = { role: "assistant", text: response.text };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          const errorMsg: Message = {
            role: "assistant",
            text:
              response.status === "validation_error"
                ? response.safeError
                : "Unexpected response from gateway.",
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      }
    } catch (err: unknown) {
      const errorText =
        err instanceof Error ? err.message : "Failed to send message. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: errorText }]);
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, isDemo, gatewayUrl, username, password]);

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
          <HermesCard title="Gateway Not Configured">
            <Text style={styles.infoText}>
              Please configure your Gateway in Settings before using the chat.
            </Text>
          </HermesCard>
          <Link href="/settings" asChild>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Go to Settings</Text>
            </Pressable>
          </Link>
          <Pressable style={styles.demoButton} onPress={handleStartDemo}>
            <Text style={styles.demoButtonText}>Continue in Demo Mode</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  if (loadState === "no_provider") {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <HermesCard title="No Provider Selected">
            <Text style={styles.infoText}>
              Please select a provider and model to start chatting.
            </Text>
          </HermesCard>
          <Link href="/providers" asChild>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Select Provider</Text>
            </Pressable>
          </Link>
          <Pressable style={styles.demoButton} onPress={handleStartDemo}>
            <Text style={styles.demoButtonText}>Continue in Demo Mode</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell safeMode={safeMode}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.container}>
          {/* Connection info card */}
          <HermesCard title={isDemo ? "Connected (Demo Mode)" : "Connected"}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gateway</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {gatewayUrl}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Provider</Text>
              <Text style={styles.infoValue}>{provider}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Model</Text>
              <Text style={styles.infoValue}>{model}</Text>
            </View>
            <View style={styles.badgeRow}>
              {safeMode && <StatusPill label="Safe Mode" color={darkTheme.accent} />}
              {isDemo && <StatusPill label="Demo Mode" color={darkTheme.accent} />}
              <StatusPill label="Connected" color={darkTheme.success} />
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
                <Text style={styles.emptyText}>
                  Send a message to start the conversation.
                </Text>
              </View>
            ) : (
              messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.bubble,
                    msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      msg.role === "user"
                        ? styles.bubbleTextUser
                        : styles.bubbleTextAssistant,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))
            )}

            {/* Sending indicator */}
            {isSending && (
              <View style={[styles.bubble, styles.bubbleAssistant, styles.sendingBubble]}>
                <ActivityIndicator size="small" color={darkTheme.textSecondary} />
                <Text style={[styles.bubbleTextAssistant, { marginLeft: 8 }]}>
                  Thinking...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={darkTheme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              editable={!isSending}
            />
            <Pressable
              style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
              disabled={!inputText.trim() || isSending}
              onPress={handleSend}
            >
              <Text style={styles.sendButtonText}>Send</Text>
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  infoLabel: {
    color: darkTheme.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    color: darkTheme.text,
    fontSize: 13,
    fontFamily: "monospace",
    flexShrink: 1,
    marginLeft: 8,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 10,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
  },
  bubbleUser: {
    backgroundColor: "#1A73E8",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
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
    color: "#FFFFFF",
  },
  sendingBubble: {
    flexDirection: "row",
    alignItems: "center",
  },
  // --- Input bar ---
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: darkTheme.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: darkTheme.surface,
    color: darkTheme.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  sendButton: {
    backgroundColor: darkTheme.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
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
