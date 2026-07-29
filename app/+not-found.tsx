import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ScreenShell } from "../src/components/ScreenShell";
import { darkTheme } from "../src/theme/theme";

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: darkTheme.background,
  },
  code: {
    fontSize: 64,
    fontWeight: "800",
    color: darkTheme.error,
    marginBottom: 8,
  },
  message: {
    fontSize: 18,
    color: darkTheme.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  link: {
    fontSize: 16,
    color: darkTheme.primary,
    fontWeight: "600",
  },
});

export default function NotFoundScreen() {
  return (
    <ScreenShell>
      <View style={s.container}>
        <Text style={s.code}>404</Text>
        <Text style={s.message}>This page doesn{"'"}t exist.</Text>
        <Link href="/" style={s.link}>
          Go back home
        </Link>
      </View>
    </ScreenShell>
  );
}
