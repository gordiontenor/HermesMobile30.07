export type HermesGatewaySetupState =
  | "not_configured"
  | "editing"
  | "local_validation_failed"
  | "ready_to_test"
  | "reset_complete"
  | "testing"
  | "success"
  | "auth_failed"
  | "network_timeout"
  | "network_failed";

export type HermesGatewaySetupConfig = {
  url: string;
  username: string;
  password: string;
  isDirty: boolean;
};

export type HermesGatewaySetupViewModel = {
  state: HermesGatewaySetupState;
  isValid: boolean;
  message: string;
};

export type HermesGatewayTestResultStatus =
  | "idle"
  | "testing"
  | "success"
  | "auth_failed"
  | "network_failed"
  | "network_timeout"
  | "unexpected_response"
  | "not_configured"
  | "registry_unavailable";

export function getHermesGatewayTestResultMessage(
  status: Exclude<HermesGatewayTestResultStatus, "idle">,
): string {
  switch (status) {
    case "testing":
      return "Testing connection...";
    case "success":
      return "Gateway reachable.";
    case "auth_failed":
      return "Authentication failed.";
    case "network_timeout":
      return "Connection timed out before the test could finish.";
    case "unexpected_response":
      return "Unexpected response.";
    case "network_failed":
      return "App could not receive any response from gateway.";
    case "not_configured":
      return "Gateway is not configured.";
    case "registry_unavailable":
      return "Provider registry is unavailable.";
  }
}

export function getHermesGatewayRouteStepLabel(
  status: import("../api/hermesGatewayRouteDiagnostic").HermesGatewayRouteStepStatus,
  statusCategory?: import("../api/hermesReadonlyGatewayTransportError").HermesReadonlyGatewayHttpStatusCategory,
): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "success":
      return "Passed";
    case "auth_required":
      return "Auth required";
    case "skipped":
      return "Not run";
    case "auth_failed":
      return "Auth failed";
    case "network_failed":
      return "Network failed";
    case "timeout":
      return "Timed out";
    case "unexpected_response":
      return "Unexpected response";
    case "status_code_category":
      return statusCategory === "server_error"
        ? "Server error"
        : statusCategory === "client_error"
          ? "Request rejected"
          : "HTTP error";
  }
}

export function validateHermesGatewaySetup(
  config: HermesGatewaySetupConfig,
): HermesGatewaySetupViewModel {
  const isUrlEmpty = config.url.trim() === "";
  const isUsernameEmpty = config.username.trim() === "";
  const isPasswordEmpty = config.password === "";

  if (isUrlEmpty && isUsernameEmpty && isPasswordEmpty) {
    return {
      state: config.isDirty ? "reset_complete" : "not_configured",
      isValid: false,
      message: "Gateway is not configured.",
    };
  }

  if (isUrlEmpty) {
    return {
      state: config.isDirty ? "local_validation_failed" : "editing",
      isValid: false,
      message: "URL is required.",
    };
  }

  if (!config.url.startsWith("https://") && !config.url.startsWith("http://")) {
    return {
      state: "local_validation_failed",
      isValid: false,
      message: "URL must start with https:// or http://",
    };
  }

  if (isUsernameEmpty) {
    return {
      state: config.isDirty ? "local_validation_failed" : "editing",
      isValid: false,
      message: "Username is required.",
    };
  }

  if (isPasswordEmpty) {
    return {
      state: config.isDirty ? "local_validation_failed" : "editing",
      isValid: false,
      message: "Password is required.",
    };
  }

  return {
    state: "ready_to_test",
    isValid: true,
    message: "Ready to test connection locally.",
  };
}

export function isHermesGatewayReadyForLiveRequests(
  config: HermesGatewaySetupConfig,
): boolean {
  return validateHermesGatewaySetup(config).isValid;
}

export function shouldUseLiveChat(config: HermesGatewaySetupConfig): boolean {
  return config.url.trim() !== "" || config.username.trim() !== "" || config.password !== "";
}

export function resolveHermesChatMode(config: HermesGatewaySetupConfig): "live_no_tools" | "mock" {
  return isHermesGatewayReadyForLiveRequests(config) ? "live_no_tools" : "mock";
}

export function describeHermesChatReadiness(config: HermesGatewaySetupConfig): string | null {
  const validation = validateHermesGatewaySetup(config);
  if (validation.isValid) {
    return null;
  }
  return validation.message;
}