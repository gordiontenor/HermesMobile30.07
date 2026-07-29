import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GATEWAY_URL_KEY = "@hermes/gatewayUrl";
const USERNAME_KEY = "@hermes/username";
const PASSWORD_KEY = "@hermes/password";

export function useGatewayPersistence() {
  const [gatewayUrl, setGatewayUrlState] = useState<string>("");
  const [username, setUsernameState] = useState<string>("");
  const [password, setPasswordState] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.multiGet([
          GATEWAY_URL_KEY,
          USERNAME_KEY,
          PASSWORD_KEY,
        ]);
        const storedUrl = stored[0][1] ?? "";
        const storedUser = stored[1][1] ?? "";
        const storedPass = stored[2][1] ?? "";
        setGatewayUrlState(storedUrl);
        setUsernameState(storedUser);
        setPasswordState(storedPass);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setGatewayUrl = useCallback((v: string) => {
    setGatewayUrlState(v);
    AsyncStorage.setItem(GATEWAY_URL_KEY, v).catch(() => {});
  }, []);

  const setUsername = useCallback((v: string) => {
    setUsernameState(v);
    AsyncStorage.setItem(USERNAME_KEY, v).catch(() => {});
  }, []);

  const setPassword = useCallback((v: string) => {
    setPasswordState(v);
    AsyncStorage.setItem(PASSWORD_KEY, v).catch(() => {});
  }, []);

  return {
    gatewayUrl,
    username,
    password,
    setGatewayUrl,
    setUsername,
    setPassword,
    loaded,
  };
}
