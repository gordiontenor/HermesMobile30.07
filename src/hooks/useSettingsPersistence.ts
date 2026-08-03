import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAMING_ENABLED_KEY = "@hermes/streamingEnabled";

export function useSettingsPersistence() {
  const [streamingEnabled, setStreamingEnabledState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STREAMING_ENABLED_KEY)
      .then((value) => setStreamingEnabledState(value === "true"))
      .catch(() => setStreamingEnabledState(false));
  }, []);

  const setStreamingEnabled = useCallback((value: boolean) => {
    setStreamingEnabledState(value);
    AsyncStorage.setItem(STREAMING_ENABLED_KEY, String(value)).catch(() => {});
  }, []);

  return { streamingEnabled, setStreamingEnabled };
}
