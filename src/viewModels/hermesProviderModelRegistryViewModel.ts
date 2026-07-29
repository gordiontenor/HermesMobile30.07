import type { HermesProviderModelRegistry } from "../types/hermesProviderModel";

export type HermesProviderModelRegistryRequiredFields = {
  registryVersion: boolean;
  providers: boolean;
  policy: boolean;
};

export type HermesProviderModelRegistrySafeFlags = {
  textOnlyAllowed?: boolean;
  providerRoutingAllowed?: boolean;
  toolsAllowed?: boolean;
  skillExecutionAllowed?: boolean;
};

export type HermesProviderModelRegistryShapeSummary = {
  requiredFieldsPresent: HermesProviderModelRegistryRequiredFields;
  safeFlags: HermesProviderModelRegistrySafeFlags;
};

export type HermesProviderModelRegistryValidationFailureClass =
  | "validator_rejected"
  | "missing_required_field";

export type HermesProviderModelRegistryValidationResult =
  | {
      status: "ok";
      registry: HermesProviderModelRegistry;
      summary: HermesProviderModelRegistryShapeSummary;
    }
  | {
      status: "validation_error";
      safeError: string;
      failureClass: HermesProviderModelRegistryValidationFailureClass;
      summary: HermesProviderModelRegistryShapeSummary;
    };

function readRequiredFieldsPresent(
  payload: Partial<HermesProviderModelRegistry>,
): HermesProviderModelRegistryRequiredFields {
  return {
    registryVersion: typeof payload.registryVersion === "string",
    providers: Array.isArray(payload.providers),
    policy: typeof payload.policy === "object" && payload.policy !== null,
  };
}

function readSafeFlags(
  payload: Partial<HermesProviderModelRegistry>,
): HermesProviderModelRegistrySafeFlags {
  const policy = payload.policy;
  if (!policy || typeof policy !== "object") {
    return {};
  }

  return {
    textOnlyAllowed:
      typeof policy.textOnlyAllowed === "boolean"
        ? policy.textOnlyAllowed
        : undefined,
    providerRoutingAllowed:
      typeof policy.providerRoutingAllowed === "boolean"
        ? policy.providerRoutingAllowed
        : undefined,
    toolsAllowed:
      typeof policy.toolsAllowed === "boolean"
        ? policy.toolsAllowed
        : undefined,
    skillExecutionAllowed:
      typeof policy.skillExecutionAllowed === "boolean"
        ? policy.skillExecutionAllowed
        : undefined,
  };
}

export function inspectHermesProviderModelRegistryShape(
  data: unknown,
): HermesProviderModelRegistryShapeSummary {
  if (typeof data !== "object" || data === null) {
    return {
      requiredFieldsPresent: {
        registryVersion: false,
        providers: false,
        policy: false,
      },
      safeFlags: {},
    };
  }

  const payload = data as Partial<HermesProviderModelRegistry>;
  return {
    requiredFieldsPresent: readRequiredFieldsPresent(payload),
    safeFlags: readSafeFlags(payload),
  };
}

export function validateHermesProviderModelRegistry(
  data: unknown
): HermesProviderModelRegistryValidationResult {
  const summary = inspectHermesProviderModelRegistryShape(data);

  if (typeof data !== "object" || data === null) {
    return {
      status: "validation_error",
      safeError: "Registry response is not an object",
      failureClass: "validator_rejected",
      summary,
    };
  }

  const payload = data as Partial<HermesProviderModelRegistry>;

  if (typeof payload.registryVersion !== "string") {
    return {
      status: "validation_error",
      safeError: "Missing registryVersion",
      failureClass: "missing_required_field",
      summary,
    };
  }

  if (!Array.isArray(payload.providers)) {
    return {
      status: "validation_error",
      safeError: "Missing providers array",
      failureClass: "missing_required_field",
      summary,
    };
  }

  for (const provider of payload.providers) {
    if (typeof provider.providerId !== "string" || !provider.providerId) {
      return {
        status: "validation_error",
        safeError: "Invalid providerId",
        failureClass: "validator_rejected",
        summary,
      };
    }
    if (!Array.isArray(provider.models)) {
      // Providers with no models are valid but may be disabled
      provider.models = [];
    }
    for (const model of provider.models) {
      if (typeof model.modelId !== "string" || !model.modelId) {
        // Skip invalid models instead of rejecting the whole registry
        continue;
      }
    }
  }

  // Policy is optional — if not provided, use sensible defaults
  if (typeof payload.policy !== "object" || payload.policy === null) {
    (payload as any).policy = {
      textOnlyAllowed: true,
      toolsAllowed: false,
      skillExecutionAllowed: false,
      providerRoutingAllowed: false,
    };
  }

  return {
    status: "ok",
    registry: data as HermesProviderModelRegistry,
    summary,
  };
}
