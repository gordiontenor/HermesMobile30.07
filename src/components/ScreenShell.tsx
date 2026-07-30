import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { darkTheme } from "../theme/theme";

interface Props {
  children: React.ReactNode;
  safeMode?: boolean;
}

export const ScreenShell: React.FC<Props> = ({ children, safeMode }) => (
  <SafeAreaView
    style={[styles.container, safeMode && styles.safeModeContainer]}
    edges={["bottom"]}
  >
    <StatusBar barStyle="light-content" backgroundColor={darkTheme.background} />
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.background },
  safeModeContainer: { backgroundColor: "#080B10" },
});
