import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
  safeMode?: boolean;
}

export const ScreenShell: React.FC<Props> = ({ children, safeMode }) => (
  <SafeAreaView style={[styles.container, safeMode && styles.safeModeContainer]}>
    <StatusBar barStyle="light-content" />
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E1116" },
  safeModeContainer: { backgroundColor: "#080B10" },
});
