export type HermesGatewayRouteStepStatus =
  | "pending" | "success" | "auth_required" | "skipped"
  | "auth_failed" | "network_failed" | "timeout" | "unexpected_response" | "status_code_category";

export type HermesGatewayRouteDiagnosticResult = {
  status: "idle" | "testing" | "success" | "error";
  message?: string;
};

export function pendingHermesGatewayRouteDiagnostic(): HermesGatewayRouteDiagnosticResult {
  return { status: "idle" };
}

export async function runHermesGatewayRouteDiagnostic(
  config: { url?: string }
): Promise<HermesGatewayRouteDiagnosticResult> {
  if (!config.url) {
    return { status: "error", message: "No URL configured" };
  }
  try {
    const resp = await fetch(config.url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    if (resp.ok) return { status: "success", message: `HTTP ${resp.status}` };
    return { status: "error", message: `HTTP ${resp.status}` };
  } catch (e: any) {
    return { status: "error", message: e?.message || "Connection failed" };
  }
}
