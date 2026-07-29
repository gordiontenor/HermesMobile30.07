import { createHermesReadonlyGatewayTransportError } from "./hermesReadonlyGatewayTransportError";
import type { HermesGatewaySetupConfig } from "../viewModels/hermesGatewaySetupViewModel";
import type { HermesChatResponse } from "../types/hermesChatContract";
import type { HermesChatRoutingPayload } from "../viewModels/hermesProviderModelRoutingViewModel";
import {
  buildHermesGatewayUrl,
  createHermesGatewayAuthenticatedHeaders,
  fetchHermesGatewayWithTimeout,
} from "./hermesGatewayRequest";
import { parseChatRequest, parseChatResponse } from "./hermesChatValidation";

export async function sendLiveNoToolsChatMessage(
  config: HermesGatewaySetupConfig,
  payload: unknown,
  routingPayload?: HermesChatRoutingPayload | null
): Promise<HermesChatResponse> {
  const parsed = parseChatRequest(payload);
  if ("status" in parsed && parsed.status === "validation_error") {
    return {
      status: "validation_error",
      safeError: parsed.safeError,
    };
  }

  const finalPayload = routingPayload
    ? { ...parsed, ...routingPayload }
    : parsed;

  let response: Response;
  try {
    response = await fetchHermesGatewayWithTimeout(
      buildHermesGatewayUrl(config, "/chat/message"),
      {
        method: "POST",
        headers: createHermesGatewayAuthenticatedHeaders(config, {
          includeJsonContentType: true,
        }),
        body: JSON.stringify(finalPayload),
      },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "network_timeout") {
      throw createHermesReadonlyGatewayTransportError("network_timeout");
    }
    if (error instanceof Error && error.message === "network_failed") {
      throw createHermesReadonlyGatewayTransportError("network_failed");
    }
    throw createHermesReadonlyGatewayTransportError("network_failed");
  }

  if (response.status === 401 || response.status === 403) {
    throw createHermesReadonlyGatewayTransportError("auth_failed");
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw createHermesReadonlyGatewayTransportError("unexpected_response");
  }

  const parsedResponse = parseChatResponse(json);
  if (parsedResponse.status === "ok") {
    return parsedResponse;
  }

  if (!response.ok) {
    return parsedResponse;
  }

  if (parsedResponse.status === "unexpected_response") {
    throw createHermesReadonlyGatewayTransportError("unexpected_response");
  }

  return parsedResponse;
}
