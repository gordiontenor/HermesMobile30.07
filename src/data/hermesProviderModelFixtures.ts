import { HermesProviderModelRegistry } from "../types/hermesProviderModel";

// This file contains ONLY static, non-secret mock data for UI layout preview.
// No API keys, passwords, private host URLs, or secret values are permitted here.

export const MOCK_PROVIDER_REGISTRY: HermesProviderModelRegistry = {
  registryVersion: "1.0.0",
  generatedAt: "2026-01-01T00:00:00.000Z",
  policy: {
    textOnlyAllowed: true,
    toolsAllowed: false,
    skillExecutionAllowed: false,
    providerRoutingAllowed: false,
  },
  providers: [
    {
      providerId: "deepseek",
      providerLabel: "DeepSeek",
      providerDescription: "High-performance reasoning models",
      enabled: true,
      models: [
        {
          modelId: "deepseek-v4-flash",
          modelLabel: "DeepSeek V4 Flash",
          modelDescription: "Fast, efficient daily driver model.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          isDefault: true,
          enabled: true,
        },
        {
          modelId: "deepseek-v4-pro",
          modelLabel: "DeepSeek V4 Pro",
          modelDescription: "Deep reasoning for complex tasks.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
      ],
    },
    {
      providerId: "openai-codex",
      providerLabel: "OpenAI Codex (OAuth)",
      providerDescription: "OpenAI Codex via OAuth - coding & advanced tasks",
      enabled: true,
      models: [
        {
          modelId: "gpt-4o",
          modelLabel: "GPT-4o",
          modelDescription: "OpenAI's flagship multimodal model.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: true,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
        {
          modelId: "gpt-4.5",
          modelLabel: "GPT-4.5",
          modelDescription: "Latest GPT model with enhanced reasoning.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: true,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
      ],
    },
    {
      providerId: "openrouter",
      providerLabel: "OpenRouter",
      providerDescription: "Multi-provider gateway - Claude, Llama, Gemini & more",
      enabled: true,
      models: [
        {
          modelId: "anthropic/claude-sonnet-4",
          modelLabel: "Claude Sonnet 4",
          modelDescription: "Balanced intelligence and speed via OpenRouter.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: true,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
        {
          modelId: "anthropic/claude-opus-4",
          modelLabel: "Claude Opus 4",
          modelDescription: "Deep reasoning flagship model.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: true,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
        {
          modelId: "meta-llama/llama-3.1-405b",
          modelLabel: "Llama 3.1 405B",
          modelDescription: "Meta's largest open-weight model.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
        {
          modelId: "google/gemini-2.5-pro",
          modelLabel: "Gemini 2.5 Pro",
          modelDescription: "Google's advanced reasoning model.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: true,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
      ],
    },
    {
      providerId: "opencode-go",
      providerLabel: "OpenCode Go",
      providerDescription: "OpenAI Codex Go integration for coding tasks",
      enabled: true,
      models: [
        {
          modelId: "opencode-go-default",
          modelLabel: "OpenCode Go",
          modelDescription: "Default coding agent model via OpenCode Go.",
          capabilities: {
            requiresTools: true,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
      ],
    },
    {
      providerId: "ollama-local",
      providerLabel: "Ollama (VPS Local)",
      providerDescription: "Self-hosted local models on VPS",
      enabled: true,
      models: [
        {
          modelId: "glm-5.2:cloud",
          modelLabel: "GLM 5.2 Cloud",
          modelDescription: "Cloud-enabled GLM model via local Ollama.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: false,
          },
          riskLevel: "low",
          enabled: true,
        },
        {
          modelId: "gemma4:31b-cloud",
          modelLabel: "Gemma 4 31B",
          modelDescription: "Google Gemma 4 via local Ollama.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: false,
          },
          riskLevel: "medium",
          enabled: true,
        },
        {
          modelId: "qwen2.5:3b",
          modelLabel: "Qwen 2.5 3B",
          modelDescription: "Fast lightweight local model.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: false,
          },
          riskLevel: "low",
          enabled: true,
        },
      ],
    },
    {
      providerId: "nous-portal",
      providerLabel: "Nous Portal",
      providerDescription: "Nous Research models via Portal",
      enabled: true,
      models: [
        {
          modelId: "nous-hermes-3-llama-3.1-405b",
          modelLabel: "Hermes 3 (405B)",
          modelDescription: "Nous Hermes via Portal - high quality open model.",
          capabilities: {
            requiresTools: false,
            supportsStreaming: true,
            supportsVision: false,
            supportsToolCalls: true,
          },
          riskLevel: "low",
          enabled: true,
        },
      ],
    },
    {
      providerId: "local-vps",
      providerLabel: "VPS Self-Hosted",
      providerDescription: "Other self-hosted services on VPS",
      enabled: false,
      models: [],
    },
  ],
};
