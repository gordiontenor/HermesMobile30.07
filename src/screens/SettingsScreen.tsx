import React, { useState } from "react";
import { View, Text, TextInput, Pressable, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "../components/ScreenShell";
import { GatewayStatusCard } from "../components/GatewayStatusCard";
import { HermesCard } from "../components/HermesCard";
import { StatusPill } from "../components/StatusPill";
import type { HermesTheme } from "../theme/theme";
import type { HermesGatewaySetupConfig, HermesGatewayTestResultStatus } from "../viewModels/hermesGatewaySetupViewModel";
import { getHermesGatewayTestResultMessage } from "../viewModels/hermesGatewaySetupViewModel";
import { fetchHermesProviderModelRegistryWithDiagnostics } from "../api/hermesProviderModelRegistryTransport";
import { Ionicons } from "@expo/vector-icons";
import { useGatewayPersistence } from "../hooks/useGatewayPersistence";
import { useProviderApiKeys } from "../hooks/useProviderApiKeys";

interface Props {
  theme: HermesTheme;
  safeMode: boolean;
  onSafeModeChange: (v: boolean) => void;
}

export default function SettingsScreen({ theme, safeMode, onSafeModeChange }: Props) {
  const { gatewayUrl, username, password, setGatewayUrl, setUsername, setPassword } = useGatewayPersistence();
  const { deepseekKey, opencodeKey, openrouterKey, openaiConnected, setDeepseekKey, setOpencodeKey, setOpenrouterKey } = useProviderApiKeys();
  const [connectionStatus, setConnectionStatus] = useState<HermesGatewayTestResultStatus>("idle");
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [showOpencode, setShowOpencode] = useState(false);
  const [showOpenrouter, setShowOpenrouter] = useState(false);

  const handleConnect = async () => {
    const config: HermesGatewaySetupConfig = {
      url: gatewayUrl,
      username,
      password,
      isDirty: true,
    };

    setConnectionStatus("testing");

    const result = await fetchHermesProviderModelRegistryWithDiagnostics(config);

    if (result.status === "success") {
      setConnectionStatus("success");
      router.push("/providers");
    } else {
      switch (result.diagnostics.failureClass) {
        case "auth_failed":
          setConnectionStatus("auth_failed");
          break;
        case "timeout":
          setConnectionStatus("network_timeout");
          break;
        case "network_failed":
          setConnectionStatus("network_failed");
          break;
        case "non_ok_http":
          setConnectionStatus("registry_unavailable");
          break;
        case "parse_failed":
        case "validator_rejected":
        case "missing_required_field":
        case "unknown":
          setConnectionStatus("unexpected_response");
          break;
        default:
          setConnectionStatus("not_configured");
          break;
      }
    }
  };

  const statusMessage =
    connectionStatus !== "idle" ? getHermesGatewayTestResultMessage(connectionStatus) : null;

  const statusColor =
    connectionStatus === "success"
      ? theme.success
      : connectionStatus === "testing"
        ? theme.textSecondary
        : connectionStatus !== "idle"
          ? theme.error
          : theme.textSecondary;

  const dynamicStyles = {
    title: { color: theme.text, fontSize: 24, fontWeight: "700" as const, marginBottom: 16 },
    input: {
      backgroundColor: theme.surface,
      color: theme.text,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    button: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: "center" as const,
      marginTop: 8,
    },
    buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" as const },
    infoText: { color: theme.textSecondary, fontSize: 14, marginBottom: 8 },
    label: { color: theme.text, fontSize: 16 },
    placeholderTextColor: theme.textSecondary,
    statusText: { color: statusColor, fontSize: 14, marginTop: 8, textAlign: "center" as const },
  };

  return (
    <ScreenShell safeMode={safeMode}>
      <ScrollView style={styles.container}>
        <Text style={dynamicStyles.title}>Settings</Text>

        <HermesCard title="Gateway Connection">
          <TextInput
            style={dynamicStyles.input}
            placeholder="Gateway URL"
            placeholderTextColor={dynamicStyles.placeholderTextColor}
            value={gatewayUrl}
            onChangeText={setGatewayUrl}
          />
          <TextInput
            style={dynamicStyles.input}
            placeholder="Username"
            placeholderTextColor={dynamicStyles.placeholderTextColor}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={dynamicStyles.input}
            placeholder="Password"
            placeholderTextColor={dynamicStyles.placeholderTextColor}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            style={dynamicStyles.button}
            onPress={handleConnect}
            disabled={connectionStatus === "testing"}
          >
            <Text style={dynamicStyles.buttonText}>
              {connectionStatus === "testing" ? "Connecting..." : "Connect"}
            </Text>
          </Pressable>
          {statusMessage && (
            <Text style={dynamicStyles.statusText}>{statusMessage}</Text>
          )}
          <Pressable
            style={{ marginTop: 12, alignItems: "center" }}
            onPress={() => router.push("/providers")}
          >
            <Text style={{ color: theme.primary, fontSize: 14 }}>
              Skip — Use Demo Mode
            </Text>
          </Pressable>
        </HermesCard>

        <HermesCard title="Provider API Keys">
          <View style={{ marginBottom: 8 }}>
            <Text style={dynamicStyles.label}>DeepSeek API Key</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TextInput
                style={[dynamicStyles.input, { flex: 1 }]}
                placeholder="sk-..."
                placeholderTextColor={dynamicStyles.placeholderTextColor}
                value={deepseekKey}
                onChangeText={setDeepseekKey}
                secureTextEntry={!showDeepseek}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowDeepseek(!showDeepseek)} style={{ padding: 8 }}>
                <Ionicons
                  name={showDeepseek ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={dynamicStyles.label}>OpenRouter API Key</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TextInput
                style={[dynamicStyles.input, { flex: 1 }]}
                placeholder="sk-or-..."
                placeholderTextColor={dynamicStyles.placeholderTextColor}
                value={openrouterKey}
                onChangeText={setOpenrouterKey}
                secureTextEntry={!showOpenrouter}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowOpenrouter(!showOpenrouter)} style={{ padding: 8 }}>
                <Ionicons
                  name={showOpenrouter ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={dynamicStyles.label}>OpenCode API Key</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TextInput
                style={[dynamicStyles.input, { flex: 1 }]}
                placeholder="sk-..."
                placeholderTextColor={dynamicStyles.placeholderTextColor}
                value={opencodeKey}
                onChangeText={setOpencodeKey}
                secureTextEntry={!showOpencode}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowOpencode(!showOpencode)} style={{ padding: 8 }}>
                <Ionicons
                  name={showOpencode ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text style={dynamicStyles.label}>OpenAI OAuth</Text>
            <Text style={[dynamicStyles.infoText, { marginTop: 4 }]}>
              {openaiConnected ? "Connected" : "Not connected"} — Connect via jcode on VPS
            </Text>
          </View>
        </HermesCard>

        <HermesCard title="Provider Model Registry">
          <Text style={dynamicStyles.infoText}>
            {safeMode ? "Safe mode: text-only models" : "Full provider selection"}
          </Text>
          <View style={styles.pillRow}>
            <StatusPill label="DeepSeek" color={theme.primary} />
            <StatusPill label="OpenAI" color={theme.primary} />
            <StatusPill label="OpenRouter" color={theme.success} />
            <StatusPill label="Local" color={theme.accent} />
          </View>
        </HermesCard>

        <HermesCard title="Safety">
          <View style={styles.row}>
            <Text style={dynamicStyles.label}>Safe Mode</Text>
            <Pressable
              style={[styles.toggle, safeMode && dynamicStyles.button]}
              onPress={() => onSafeModeChange(!safeMode)}
            >
              <View style={[styles.toggleThumb, safeMode && styles.toggleThumbActive]} />
            </Pressable>
          </View>
        </HermesCard>

        <GatewayStatusCard status={gatewayUrl ? "Configured" : "Not Connected"} url={gatewayUrl} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3C4043",
    justifyContent: "center",
    padding: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  toggleThumbActive: { alignSelf: "flex-end" },
});
