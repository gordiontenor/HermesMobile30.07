import { createHermesReadonlyGatewayTransportError } from "./hermesReadonlyGatewayTransportError";
import type { HermesGatewaySetupConfig } from "../viewModels/hermesGatewaySetupViewModel";
import type { HermesProviderModelRegistry } from "../types/hermesProviderModel";
import {
  buildHermesGatewayUrl,
  createHermesGatewayAuthenticatedHeaders,
  fetchHermesGatewayWithTimeout,
} from "./hermesGatewayRequest";
import {
  inspectHermesProviderModelRegistryShape,
  validateHermesProviderModelRegistry,
} from "../viewModels/hermesProviderModelRegistryViewModel";
import {
  createHermesProviderModelRegistryDiagnostics,
  type HermesProviderModelRegistryDiagnostics,
} from "../viewModels/hermesProviderModelRegistryDiagnostics";

export type HermesProviderModelRegistryFetchResult =
  | {
      status: "success";
      registry: HermesProviderModelRegistry;
      diagnostics: HermesProviderModelRegistryDiagnostics;
    }
  | {
      status: "error";
      diagnostics: HermesProviderModelRegistryDiagnostics;
    };

export async function fetchHermesProviderModelRegistryWithDiagnostics(
  config: HermesGatewaySetupConfig,
): Promise<HermesProviderModelRegistryFetchResult> {
  if (!config.url || !config.username || !config.password) {
    return {
      status: "error",
      diagnostics: createHermesProviderModelRegistryDiagnostics({
        configured: false,
        requestStage: "not_configured",
      }),
    };
  }

  let response: Response;
  try {
    response = await fetchHermesGatewayWithTimeout(
      buildHermesGatewayUrl(config, "/chat/provider-models"),
      {
        method: "GET",
        headers: createHermesGatewayAuthenticatedHeaders(config, {
          includeJsonContentType: true,
        }),
      },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "network_timeout") {
      return {
        status: "error",
        diagnostics: createHermesProviderModelRegistryDiagnostics({
          configured: true,
          requestStage: "network_request",
          failureClass: "timeout",
        }),
      };
    }

    return {
      status: "error",
      diagnostics: createHermesProviderModelRegistryDiagnostics({
        configured: true,
        requestStage: "network_request",
        failureClass: "network_failed",
      }),
    };
  }

  if (response.status === 401 || response.status === 403) {
    return {
      status: "error",
      diagnostics: createHermesProviderModelRegistryDiagnostics({
        configured: true,
        requestStage: "http_response",
        failureClass: "auth_failed",
        httpStatusCode: response.status,
      }),
    };
  }

  if (!response.ok) {
    return {
      status: "error",
      diagnostics: createHermesProviderModelRegistryDiagnostics({
        configured: true,
        requestStage: "http_response",
        failureClass: "non_ok_http",
        httpStatusCode: response.status,
      }),
    };
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return {
      status: "error",
      diagnostics: createHermesProviderModelRegistryDiagnostics({
        configured: true,
        requestStage: "parse_json",
        failureClass: "parse_failed",
        httpStatusCode: response.status,
      }),
    };
  }

  const summary = inspectHermesProviderModelRegistryShape(json);
  const validationResult = validateHermesProviderModelRegistry(json);

  if (validationResult.status === "validation_error") {
    return {
      status: "error",
      diagnostics: createHermesProviderModelRegistryDiagnostics({
        configured: true,
        requestStage: "validate_registry",
        failureClass: validationResult.failureClass,
        httpStatusCode: response.status,
        jsonParsed: true,
        requiredFieldsPresent: validationResult.summary.requiredFieldsPresent,
        safeFlags: validationResult.summary.safeFlags,
      }),
    };
  }

  return {
    status: "success",
    registry: validationResult.registry,
    diagnostics: createHermesProviderModelRegistryDiagnostics({
      configured: true,
      requestStage: "success",
      httpStatusCode: response.status,
      jsonParsed: true,
      requiredFieldsPresent: summary.requiredFieldsPresent,
      safeFlags: summary.safeFlags,
    }),
  };
}

export async function fetchHermesProviderModelRegistry(
  config: HermesGatewaySetupConfig,
): Promise<HermesProviderModelRegistry> {
  const result = await fetchHermesProviderModelRegistryWithDiagnostics(config);
  if (result.status === "success") {
    return result.registry;
  }

  switch (result.diagnostics.failureClass) {
    case "auth_failed":
      throw createHermesReadonlyGatewayTransportError("auth_failed");
    case "network_failed":
      throw createHermesReadonlyGatewayTransportError("network_failed");
    case "timeout":
      throw createHermesReadonlyGatewayTransportError("network_timeout");
    case "non_ok_http":
      throw createHermesReadonlyGatewayTransportError("registry_unavailable");
    case "parse_failed":
    case "validator_rejected":
    case "missing_required_field":
    case "unknown":
      throw createHermesReadonlyGatewayTransportError("unexpected_response");
    default:
      throw createHermesReadonlyGatewayTransportError("not_configured");
  }
}
