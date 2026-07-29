import { hermesBuildInfo } from "../config/hermesBuildInfo";

export type HermesProviderModelRegistryRequestStage =
  | "not_configured"
  | "preparing_request"
  | "network_request"
  | "http_response"
  | "parse_json"
  | "validate_registry"
  | "success";

export type HermesProviderModelRegistryFailureClass =
  | "auth_failed"
  | "network_failed"
  | "timeout"
  | "non_ok_http"
  | "parse_failed"
  | "validator_rejected"
  | "missing_required_field"
  | "unknown";

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

export type HermesProviderModelRegistryDiagnostics = {
  configured: boolean;
  requestPath: "/chat/provider-models";
  requestStage: HermesProviderModelRegistryRequestStage;
  failureClass: HermesProviderModelRegistryFailureClass | null;
  httpStatusCode: number | null;
  jsonParsed: boolean;
  requiredFieldsPresent: HermesProviderModelRegistryRequiredFields;
  safeFlags: HermesProviderModelRegistrySafeFlags;
  buildPhase: string;
  buildLabel: string;
  lastRefreshAt: string;
};

const defaultRequiredFields: HermesProviderModelRegistryRequiredFields = {
  registryVersion: false,
  providers: false,
  policy: false,
};

export function createHermesProviderModelRegistryDiagnostics(
  overrides: Partial<HermesProviderModelRegistryDiagnostics> & {
    configured: boolean;
    requestStage: HermesProviderModelRegistryRequestStage;
  },
): HermesProviderModelRegistryDiagnostics {
  return {
    configured: overrides.configured,
    requestPath: "/chat/provider-models",
    requestStage: overrides.requestStage,
    failureClass: overrides.failureClass ?? null,
    httpStatusCode: overrides.httpStatusCode ?? null,
    jsonParsed: overrides.jsonParsed ?? false,
    requiredFieldsPresent:
      overrides.requiredFieldsPresent ?? defaultRequiredFields,
    safeFlags: overrides.safeFlags ?? {},
    buildPhase: hermesBuildInfo.phase,
    buildLabel: hermesBuildInfo.label,
    lastRefreshAt: overrides.lastRefreshAt ?? new Date().toISOString(),
  };
}
