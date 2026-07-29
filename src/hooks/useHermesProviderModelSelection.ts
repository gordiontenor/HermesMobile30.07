import { useState, useCallback } from "react";
import { MOCK_PROVIDER_REGISTRY } from "../data/hermesProviderModelFixtures";

export type ProviderSelection = {
  selectedProvider: string | null;
  selectedModel: string | null;
  providers: typeof MOCK_PROVIDER_REGISTRY.providers;
  selectProvider: (id: string) => void;
  selectModel: (modelId: string) => void;
};

export function useHermesProviderModelSelection(): ProviderSelection {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const selectProvider = useCallback((id: string) => {
    setSelectedProvider(id);
    setSelectedModel(null);
  }, []);

  const selectModel = useCallback((modelId: string) => {
    setSelectedModel(modelId);
  }, []);

  return {
    selectedProvider,
    selectedModel,
    providers: MOCK_PROVIDER_REGISTRY.providers,
    selectProvider,
    selectModel,
  };
}
