import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenShell } from "../src/components/ScreenShell";
import { HermesCard } from "../src/components/HermesCard";
import { StatusPill } from "../src/components/StatusPill";
import { darkTheme } from "../src/theme/theme";
import { fetchHermesProviderModelRegistryWithDiagnostics } from "../src/api/hermesProviderModelRegistryTransport";
import type { HermesProviderModelRegistry, HermesProviderDefinition, HermesModelDefinition } from "../src/types/hermesProviderModel";

const SELECTED_PROVIDER_KEY = "@hermes/selectedProvider";
const SELECTED_MODEL_KEY = "@hermes/selectedModel";

type LoadingState = "loading" | "loaded" | "error" | "no_config";

export default function ProvidersRoute() {
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [registry, setRegistry] = useState<HermesProviderModelRegistry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModelState] = useState<string | null>(null);
  const [savedModel, setSavedModel] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.multiGet([
          "@hermes/gatewayUrl",
          "@hermes/username",
          "@hermes/password",
        ]);
        const gatewayUrl = stored[0][1] ?? "";
        const username = stored[1][1] ?? "";
        const password = stored[2][1] ?? "";

        if (!gatewayUrl || !username || !password) {
          setLoadingState("no_config");
          return;
        }

        const config = {
          url: gatewayUrl,
          username,
          password,
          isDirty: true,
        };

        const result = await fetchHermesProviderModelRegistryWithDiagnostics(config);

        if (result.status === "success") {
          setRegistry(result.registry);
          setLoadingState("loaded");
        } else {
          setErrorMessage("Failed to load provider models: " + (result.diagnostics.failureClass ?? "unknown error"));
          setLoadingState("error");
          return;
        }

        // Load previously saved selections
        const saved = await AsyncStorage.multiGet([
          SELECTED_PROVIDER_KEY,
          SELECTED_MODEL_KEY,
        ]);
        if (saved[0][1]) setSelectedProvider(saved[0][1]);
        if (saved[1][1]) {
          setSelectedModelState(saved[1][1]);
          setSavedModel(saved[1][1]);
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to load provider models");
        setLoadingState("error");
      }
    })();
  }, []);

  const handleSelectProvider = (providerId: string) => {
    setSelectedProvider(providerId === selectedProvider ? null : providerId);
  };

  const handleSelectModel = async (modelId: string, providerId: string) => {
    setSelectedModelState(modelId);
    try {
      await AsyncStorage.multiSet([
        [SELECTED_PROVIDER_KEY, providerId],
        [SELECTED_MODEL_KEY, modelId],
      ]);
      setSavedModel(modelId);
      router.push("/chat");
    } catch {
      // silently fail
    }
  };

  if (loadingState === "loading") {
    return (
      <ScreenShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={darkTheme.primary} />
          <Text style={[styles.textSecondary, { marginTop: 16 }]}>Loading provider models...</Text>
        </View>
      </ScreenShell>
    );
  }

  if (loadingState === "no_config") {
    return (
      <ScreenShell>
        <View style={styles.container}>
          <Text style={styles.header}>Provider Models</Text>
          <HermesCard title="Gateway Not Configured">
            <Text style={styles.textSecondary}>
              Please configure your Gateway connection in Settings first, then return here.
            </Text>
          </HermesCard>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Settings</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  if (loadingState === "error") {
    return (
      <ScreenShell>
        <View style={styles.container}>
          <Text style={styles.header}>Provider Models</Text>
          <HermesCard title="Error Loading Providers">
            <Text style={styles.errorText}>{errorMessage}</Text>
          </HermesCard>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Settings</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  const providers = registry?.providers ?? [];

  return (
    <ScreenShell>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Provider Models</Text>
        <Text style={styles.subtitle}>
          Select a provider and model for your Hermes Gateway connection.
        </Text>

        {savedModel && selectedProvider && (
          <HermesCard title="Current Selection">
            <Text style={styles.text}>
              Provider:{" "}
              {providers.find((p) => p.providerId === selectedProvider)?.providerLabel ??
                selectedProvider}
            </Text>
            <Text style={styles.text}>Model: {selectedModel}</Text>
          </HermesCard>
        )}

        {providers.map((provider) => {
          const isSelected = selectedProvider === provider.providerId;
          const enabledModels = provider.models.filter((m) => m.enabled);

          return (
            <HermesCard
              key={provider.providerId}
              title={provider.providerLabel}
              subtitle={provider.providerDescription}
            >
              <View style={styles.pillRow}>
                <StatusPill
                  label={provider.enabled ? "Available" : "Disabled"}
                  color={provider.enabled ? darkTheme.success : darkTheme.textSecondary}
                />
              </View>
              <Pressable
                style={{ marginTop: 8 }}
                onPress={() => handleSelectProvider(provider.providerId)}
              >
                <Text
                  style={[
                    styles.textSecondary,
                    isSelected && { color: darkTheme.primary, fontWeight: "600" },
                  ]}
                >
                  {isSelected ? "▼ Hide Models" : "▶ Show Models"}
                </Text>
              </Pressable>

              {isSelected && (
                <View style={{ marginTop: 12 }}>
                  {enabledModels.length === 0 ? (
                    <Text style={styles.textSecondary}>No models available.</Text>
                  ) : (
                    enabledModels.map((model) => {
                      const isModelSelected = selectedModel === model.modelId;

                      return (
                        <Pressable
                          key={model.modelId}
                          style={[
                            styles.modelItem,
                            isModelSelected && styles.modelItemSelected,
                          ]}
                          onPress={() => handleSelectModel(model.modelId, provider.providerId)}
                        >
                          <Text style={styles.modelLabel}>{model.modelLabel}</Text>
                          <Text style={styles.modelDesc}>{model.modelDescription}</Text>
                          <View style={styles.capsRow}>
                            {model.capabilities.supportsStreaming && (
                              <StatusPill label="Streaming" color="#8AB4F8" />
                            )}
                            {model.capabilities.supportsVision && (
                              <StatusPill label="Vision" color="#34A853" />
                            )}
                            {model.capabilities.supportsToolCalls && (
                              <StatusPill label="Tools" color="#F28B82" />
                            )}
                          </View>
                          {isModelSelected && (
                            <Text style={styles.successText}>✓ Selected</Text>
                          )}
                        </Pressable>
                      );
                    })
                  )}
                </View>
              )}
            </HermesCard>
          );
        })}

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Settings</Text>
        </Pressable>

        {/* Bottom spacer for scroll */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  header: { color: darkTheme.text, fontSize: 24, fontWeight: "700", marginBottom: 16 },
  subtitle: { color: darkTheme.textSecondary, fontSize: 14, marginBottom: 16 },
  text: { color: darkTheme.text, fontSize: 16 },
  textSecondary: { color: darkTheme.textSecondary, fontSize: 14 },
  errorText: { color: darkTheme.error, fontSize: 14, textAlign: "center", marginTop: 8 },
  successText: { color: darkTheme.success, fontSize: 14, marginTop: 4, fontWeight: "600" },
  backButton: {
    backgroundColor: darkTheme.surface,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  backButtonText: { color: darkTheme.text, fontSize: 16, fontWeight: "600" },
  modelItem: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: darkTheme.border,
  },
  modelItemSelected: {
    borderColor: darkTheme.primary,
    backgroundColor: darkTheme.surface,
  },
  modelLabel: { color: darkTheme.text, fontSize: 15, fontWeight: "600" },
  modelDesc: { color: darkTheme.textSecondary, fontSize: 12, marginTop: 2 },
  capsRow: { flexDirection: "row", gap: 4, flexWrap: "wrap", marginTop: 6 },
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});
