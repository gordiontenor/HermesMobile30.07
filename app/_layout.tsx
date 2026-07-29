import React from "react";
import { Stack } from "expo-router";
import { ScreenShell } from "../src/components/ScreenShell";
import { darkTheme } from "../src/theme/theme";

export default function RootLayout() {
  return (
    <ScreenShell>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: darkTheme.background },
          headerTintColor: darkTheme.text,
          headerTitleStyle: { fontWeight: "700", color: darkTheme.text },
          contentStyle: { backgroundColor: darkTheme.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="providers"
          options={{
            title: "Provider Models",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="chat"
          options={{
            title: "Chat",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </ScreenShell>
  );
}
