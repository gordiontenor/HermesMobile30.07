import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenShell } from "../src/components/ScreenShell";
import { HermesCard } from "../src/components/HermesCard";
import { StatusPill } from "../src/components/StatusPill";
import { darkTheme } from "../src/theme/theme";

const GATEWAY_URL_KEY = "@hermes/gatewayUrl";
const SELECTED_PROVIDER_KEY = "@hermes/selectedProvider";
const SELECTED_MODEL_KEY = "@hermes/selectedModel";
const SAFE_MODE_KEY = "@hermes/safeMode";

type LoadState = "loading" | "no_gateway" | "no_provider" | "ready";

export default function ChatRoute() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [gatewayUrl, setGatewayUrl] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [safeMode, setSafeMode] = useState(false);
  const [inputText, setInputText] = useState("");

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
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell safeMode={safeMode}>
      <View style={styles.container}>
        {/* Connection info card */}
        <HermesCard title="Connected">
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
            <StatusPill label="Connected" color={darkTheme.success} />
          </View>
        </HermesCard>

        {/* Messages area */}
        <ScrollView style={styles.messagesArea} contentContainerStyle={styles.messagesContent}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Send a message to start the conversation.
            </Text>
          </View>
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={darkTheme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
          />
          <Pressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim()}
            onPress={() => {
              // Placeholder — real API call will be wired later
              setInputText("");
            }}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
  messagesContent: {
    flexGrow: 1,
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
});
