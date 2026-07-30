import React from "react";
import { Stack } from "expo-router";
import { ScreenShell } from "../src/components/ScreenShell";
import { darkTheme } from "../src/theme/theme";

export default function RootLayout() {
  return (
    <ScreenShell>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: darkTheme.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="providers" />
        <Stack.Screen name="chat" />
      </Stack>
    </ScreenShell>
  );
}
