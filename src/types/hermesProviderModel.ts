export type HermesProviderModelCapability = {
  requiresTools: boolean;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsToolCalls: boolean;
};

export type HermesModelDefinition = {
  modelId: string;
  modelLabel: string;
  modelDescription: string;
  capabilities: HermesProviderModelCapability;
  riskLevel: "low" | "medium" | "high";
  isDefault?: boolean;
  enabled: boolean;
};

export type HermesProviderDefinition = {
  providerId: string;
  providerLabel: string;
  providerDescription: string;
  enabled: boolean;
  models: HermesModelDefinition[];
};

export type HermesProviderModelPolicy = {
  textOnlyAllowed: boolean;
  toolsAllowed: boolean;
  skillExecutionAllowed: boolean;
  providerRoutingAllowed?: boolean;
};

export type HermesProviderModelRegistry = {
  registryVersion: string;
  generatedAt: string;
  policy: HermesProviderModelPolicy;
  providers: HermesProviderDefinition[];
};
