export type HermesReadonlyGatewayTransportErrorCode =
  | "auth_failed"
  | "network_failed"
  | "network_timeout"
  | "unexpected_response"
  | "not_configured"
  | "registry_unavailable";

export type HermesReadonlyGatewayHttpStatusCategory =
  | "client_error"
  | "server_error"
  | "other_http_error";

export type HermesReadonlyGatewayTransportError = Error & {
  message: HermesReadonlyGatewayTransportErrorCode;
  statusCategory?: HermesReadonlyGatewayHttpStatusCategory;
};

export function createHermesReadonlyGatewayTransportError(
  code: HermesReadonlyGatewayTransportErrorCode,
  statusCategory?: HermesReadonlyGatewayHttpStatusCategory,
): HermesReadonlyGatewayTransportError {
  const error = new Error(code) as HermesReadonlyGatewayTransportError;
  error.statusCategory = statusCategory;
  return error;
}

export function isHermesReadonlyGatewayTransportError(
  error: unknown,
): error is HermesReadonlyGatewayTransportError {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === "auth_failed" ||
    error.message === "network_failed" ||
    error.message === "network_timeout" ||
    error.message === "unexpected_response" ||
    error.message === "not_configured" ||
    error.message === "registry_unavailable"
  );
}
