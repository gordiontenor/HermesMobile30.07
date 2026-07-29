import React from "react";
import SettingsScreen from "../src/screens/SettingsScreen";
import { darkTheme } from "../src/theme/theme";
import { useSafeModePersistence } from "../src/hooks/useSafeModePersistence";

export default function SettingsRoute() {
  const { safeMode, setSafeMode } = useSafeModePersistence();

  return (
    <SettingsScreen
      theme={darkTheme}
      safeMode={safeMode}
      onSafeModeChange={setSafeMode}
    />
  );
}
