import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEEPSEEK_KEY = "@hermes/apiKey_deepseek";
const OPENCODE_KEY = "@hermes/apiKey_opencode";
const OPENROUTER_KEY = "@hermes/apiKey_openrouter";
const OPENAI_KEY = "@hermes/apiKey_openai";

export function useProviderApiKeys() {
  const [deepseekKey, setDeepseekKeyState] = useState<string>("");
  const [opencodeKey, setOpencodeKeyState] = useState<string>("");
  const [openrouterKey, setOpenrouterKeyState] = useState<string>("");
  const [openaiConnected, setOpenaiConnectedState] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.multiGet([
          DEEPSEEK_KEY,
          OPENCODE_KEY,
          OPENROUTER_KEY,
          OPENAI_KEY,
        ]);
        setDeepseekKeyState(stored[0][1] ?? "");
        setOpencodeKeyState(stored[1][1] ?? "");
        setOpenrouterKeyState(stored[2][1] ?? "");
        setOpenaiConnectedState(stored[3][1] === "true");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setDeepseekKey = useCallback((v: string) => {
    setDeepseekKeyState(v);
    AsyncStorage.setItem(DEEPSEEK_KEY, v).catch(() => {});
  }, []);

  const setOpencodeKey = useCallback((v: string) => {
    setOpencodeKeyState(v);
    AsyncStorage.setItem(OPENCODE_KEY, v).catch(() => {});
  }, []);

  const setOpenrouterKey = useCallback((v: string) => {
    setOpenrouterKeyState(v);
    AsyncStorage.setItem(OPENROUTER_KEY, v).catch(() => {});
  }, []);

  const setOpenaiConnected = useCallback((v: boolean) => {
    setOpenaiConnectedState(v);
    AsyncStorage.setItem(OPENAI_KEY, String(v)).catch(() => {});
  }, []);

  return {
    deepseekKey,
    opencodeKey,
    openrouterKey,
    openaiConnected,
    setDeepseekKey,
    setOpencodeKey,
    setOpenrouterKey,
    setOpenaiConnected,
    loaded,
  };
}
