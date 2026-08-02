import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ScreenShell } from "../src/components/ScreenShell";
import { darkTheme } from "../src/theme/theme";
import { hermesBuildInfo } from "../src/config/hermesBuildInfo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: darkTheme.background,
  },
  // Gradient-like glowing orbs
  glowOrbTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: darkTheme.primary,
    opacity: 0.08,
  },
  glowOrbBottom: {
    position: "absolute",
    bottom: -40,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: darkTheme.accent,
    opacity: 0.06,
  },
  glowOrbMid: {
    position: "absolute",
    top: SCREEN_WIDTH * 0.4,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: darkTheme.primary,
    opacity: 0.05,
  },
  // Hero section
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: darkTheme.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: darkTheme.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: darkTheme.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  version: {
    fontSize: 13,
    color: darkTheme.textSecondary,
    fontFamily: "monospace",
    marginTop: 4,
    opacity: 0.7,
  },
  // Buttons
  buttonSection: {
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: darkTheme.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: darkTheme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  outlineButton: {
    flexDirection: "row",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: darkTheme.border,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: {
    color: darkTheme.text,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statusSection: {
    alignItems: "center",
    minHeight: 42,
  },
  statusText: {
    color: darkTheme.textSecondary,
    fontSize: 12,
    maxWidth: "100%",
  },
  demoStatus: {
    color: darkTheme.accent,
    fontSize: 12,
    marginTop: 5,
    fontWeight: "600",
  },
});

export default function IndexScreen() {
  const [connectionStatus, setConnectionStatus] = useState({
    gatewayUrl: "",
    provider: "",
    model: "",
    demoMode: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.multiGet([
          "@hermes/gatewayUrl",
          "@hermes/selectedProvider",
          "@hermes/selectedModel",
          "@hermes/demoMode",
        ]);
        setConnectionStatus({
          gatewayUrl: stored[0][1] ?? "",
          provider: stored[1][1] ?? "",
          model: stored[2][1] ?? "",
          demoMode: stored[3][1] === "true",
        });
      } catch {
        setConnectionStatus({ gatewayUrl: "", provider: "", model: "", demoMode: false });
      }
    })();
  }, []);

  const handleDemoChat = async () => {
    try {
      await AsyncStorage.multiSet([
        ["@hermes/selectedProvider", "opencode-go"],
        ["@hermes/selectedModel", "kimi-k2.5"],
        ["@hermes/demoMode", "true"],
      ]);
    } catch {
      // silently fail
    }
    router.push("/chat");
  };

  return (
    <ScreenShell>
      <View style={s.container}>
        {/* Gradient-like glowing orbs */}
        <View style={s.glowOrbTop} />
        <View style={s.glowOrbMid} />
        <View style={s.glowOrbBottom} />

        {/* Hero */}
        <View style={s.heroSection}>
          <View style={s.iconWrapper}>
            <Ionicons name="chatbubbles-outline" size={56} color={darkTheme.primary} />
          </View>
          <Text style={s.title}>Hermes Mobile</Text>
          <Text style={s.subtitle}>Yapay Zeka Gateway&apos;in</Text>
          <Text style={s.version}>Faz {hermesBuildInfo.phase}</Text>
        </View>

        {/* Buttons */}
        <View style={s.buttonSection}>
          <Link href="/settings" asChild>
            <Pressable style={s.primaryButton}>
              <Ionicons name="sparkles" size={18} color="#FFF" />
              <Text style={s.primaryButtonText}>Başla</Text>
            </Pressable>
          </Link>
          <Pressable style={s.outlineButton} onPress={handleDemoChat}>
            <Ionicons name="chatbox-ellipses-outline" size={18} color={darkTheme.text} />
            <Text style={s.outlineButtonText}>Sohbet (Demo)</Text>
          </Pressable>
          <View style={s.statusSection}>
            <Text style={s.statusText} numberOfLines={1}>
              {connectionStatus.gatewayUrl
                ? `Gateway: hazır - Provider: ${connectionStatus.provider || "-"} • Model: ${connectionStatus.model || "-"}`
                : "Gateway: bağlı değil"}
            </Text>
            {connectionStatus.demoMode && <Text style={s.demoStatus}>Demo Modu</Text>}
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}
