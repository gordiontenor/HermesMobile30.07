import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenShell } from "../src/components/ScreenShell";
import { Header } from "../src/components/Header";
import { HermesCard } from "../src/components/HermesCard";
import { darkTheme } from "../src/theme/theme";
import { useGatewayPersistence } from "../src/hooks/useGatewayPersistence";
import { useProviderApiKeys } from "../src/hooks/useProviderApiKeys";
import { sendLiveNoToolsChatMessage } from "../src/api/hermesLiveChatTransport";
import { getFriendlyChatErrorMessage } from "../src/utils/hermesChatErrorMessages";
import type { HermesGatewaySetupConfig } from "../src/viewModels/hermesGatewaySetupViewModel";

export default function OAuthRoute() {
  const { gatewayUrl, username, password } = useGatewayPersistence();
  const { openaiConnected, setOpenaiConnected } = useProviderApiKeys();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const config: HermesGatewaySetupConfig = {
      url: gatewayUrl,
      username,
      password,
      isDirty: true,
    };

    try {
      const response = await sendLiveNoToolsChatMessage(config, {
        provider: "openai-oauth",
        model: "gpt-5.4-mini",
        message: "test",
      });
      if (response.status === "ok") {
        setTestResult({ ok: true, message: "Bağlı çalışıyor" });
      } else {
        setTestResult({
          ok: false,
          message: getFriendlyChatErrorMessage(
            new Error(response.safeError),
            "OpenAI (OAuth) bağlantısı doğrulanamadı.",
          ),
        });
      }
    } catch (error: unknown) {
      setTestResult({
        ok: false,
        message: getFriendlyChatErrorMessage(
          error,
          "OpenAI (OAuth) bağlantısı doğrulanamadı.",
        ),
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScreenShell>
      <Header title="OpenAI (OAuth)" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <HermesCard title="Bağlantı Durumu">
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>VPS&apos;te şu an bağlı değil</Text>
            <Text style={styles.warningText}>
            Mevcut token yaklaşık 56 gün önce süresi dolduğu için VPS&apos;te Hermes Agent OAuth oturumu gerekli.
            </Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bağlandı Olarak İşaretle</Text>
            <Switch
              value={openaiConnected}
              onValueChange={setOpenaiConnected}
              trackColor={{ false: darkTheme.border, true: darkTheme.accent }}
              thumbColor={openaiConnected ? darkTheme.error : darkTheme.textSecondary}
            />
          </View>
        </HermesCard>

        <HermesCard title="Nasıl Bağlanır">
          <Text style={styles.step}>1. VPS&apos;te Hermes Agent&apos;ın OpenAI OAuth oturumunu yenile veya geçerli token sağla.</Text>
          <Text style={styles.step}>2. Aşağıdaki Bağlandı Olarak İşaretle seçeneğini aç.</Text>
          <Text style={styles.step}>3. Chat ekranında OpenAI (OAuth) provider&apos;ını seç.</Text>
          <Text style={styles.note}>
            OpenAI mobil OAuth&apos;u desteklemediği için bu akış VPS üzerinden işler.
          </Text>
        </HermesCard>

        <HermesCard title="Bağlantı Testi">
          <Pressable style={styles.testButton} onPress={handleTest} disabled={isTesting}>
            {isTesting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.testButtonText}>Test Et</Text>
            )}
          </Pressable>
          {testResult && (
            <Text style={[styles.result, { color: testResult.ok ? darkTheme.success : darkTheme.error }]}>
              {testResult.message}
            </Text>
          )}
        </HermesCard>

        <Pressable style={styles.chatButton} onPress={() => router.push("/providers")}>
          <Text style={styles.chatButtonText}>Provider Seçimine Git</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, paddingBottom: 32 },
  warningBox: { borderLeftWidth: 3, borderLeftColor: darkTheme.error, paddingLeft: 10 },
  warningTitle: { color: darkTheme.error, fontSize: 15, fontWeight: "700" },
  warningText: { color: darkTheme.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 6 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  toggleLabel: { color: darkTheme.text, fontSize: 14, fontWeight: "600", flex: 1 },
  step: { color: darkTheme.text, fontSize: 14, lineHeight: 21, marginTop: 8 },
  note: { color: darkTheme.accent, fontSize: 13, lineHeight: 19, marginTop: 14 },
  testButton: { backgroundColor: darkTheme.primary, borderRadius: 8, alignItems: "center", padding: 12 },
  testButtonText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  result: { fontSize: 14, fontWeight: "600", marginTop: 12, textAlign: "center" },
  chatButton: { alignItems: "center", padding: 12, marginTop: 8 },
  chatButtonText: { color: darkTheme.primary, fontSize: 14, fontWeight: "600" },
});
