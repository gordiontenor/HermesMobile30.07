import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SAFE_MODE_KEY = "@hermes/safeMode";

export function useSafeModePersistence() {
  const [safeMode, setSafeModeState] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SAFE_MODE_KEY);
        if (stored !== null) {
          setSafeModeState(stored === "true");
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setSafeMode = useCallback((v: boolean) => {
    setSafeModeState(v);
    AsyncStorage.setItem(SAFE_MODE_KEY, v ? "true" : "false").catch(() => {});
  }, []);

  return {
    safeMode,
    setSafeMode,
    loaded,
  };
}
