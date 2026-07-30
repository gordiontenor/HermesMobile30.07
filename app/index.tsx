import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenShell } from "../src/components/ScreenShell";
import { darkTheme } from "../src/theme/theme";
import { hermesBuildInfo } from "../src/config/hermesBuildInfo";

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: darkTheme.background,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: darkTheme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: darkTheme.textSecondary,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: darkTheme.textSecondary,
    fontFamily: "monospace",
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: darkTheme.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: darkTheme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
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
    marginTop: 16,
  },
  demoButtonText: {
    color: darkTheme.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function IndexScreen() {
  const handleDemoChat = async () => {
    try {
      await AsyncStorage.multiSet([
        ["@hermes/selectedProvider", "openai-codex"],
        ["@hermes/selectedModel", "gpt-4o"],
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
        <Text style={s.title}>Hermes Mobile</Text>
        <Text style={s.subtitle}>Phase {hermesBuildInfo.phase}</Text>
        <Text style={s.version}>v{hermesBuildInfo.label}</Text>
        <Text style={s.description}>
          Configure your Hermes Gateway, manage provider models, and connect to
          your AI infrastructure — all from your mobile device.
        </Text>
        <Link href="/settings" asChild>
          <Pressable style={s.button}>
            <Text style={s.buttonText}>Settings</Text>
          </Pressable>
        </Link>
        <Pressable style={s.demoButton} onPress={handleDemoChat}>
          <Text style={s.demoButtonText}>Chat (Demo)</Text>
        </Pressable>
      </View>
    </ScreenShell>
  );
}
