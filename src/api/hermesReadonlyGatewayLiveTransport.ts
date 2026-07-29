import type { HermesReadonlyGatewayTransport } from "./hermesReadonlyGatewayClient";
import type { HermesGatewaySetupConfig } from "../viewModels/hermesGatewaySetupViewModel";
import {
  createHermesReadonlyGatewayTransportError,
  type HermesReadonlyGatewayHttpStatusCategory,
} from "./hermesReadonlyGatewayTransportError";
import {
  buildHermesGatewayUrl,
  createHermesGatewayAuthenticatedHeaders,
  fetchHermesGatewayWithTimeout,
} from "./hermesGatewayRequest";

function getHttpStatusCategory(status: number): HermesReadonlyGatewayHttpStatusCategory {
  if (status >= 400 && status < 500) {
    return "client_error";
  }

  if (status >= 500 && status < 600) {
    return "server_error";
  }

  return "other_http_error";
}

function readProbeResponse(response: Response): "auth_required" | "reachable" {
  if (response.status === 401 || response.status === 403) {
    return "auth_required";
  }

  if (!response.ok) {
    throw createHermesReadonlyGatewayTransportError(
      "unexpected_response",
      getHttpStatusCategory(response.status),
    );
  }

  return "reachable";
}

async function readJsonResponse(response: Response): Promise<unknown> {
  if (response.status === 401 || response.status === 403) {
    throw createHermesReadonlyGatewayTransportError("auth_failed");
  }

  if (!response.ok) {
    throw createHermesReadonlyGatewayTransportError(
      "unexpected_response",
      getHttpStatusCategory(response.status),
    );
  }

  try {
    return await response.json();
  } catch {
    throw createHermesReadonlyGatewayTransportError("unexpected_response");
  }
}

export function createHermesReadonlyGatewayLiveTransport(
  config: HermesGatewaySetupConfig,
): HermesReadonlyGatewayTransport {
  return {
    async probeHealthWithoutAuth() {
      const response = await fetchHermesGatewayWithTimeout(
        buildHermesGatewayUrl(config, "/health"),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      );

      return readProbeResponse(response);
    },

    async getHealth() {
      const response = await fetchHermesGatewayWithTimeout(
        buildHermesGatewayUrl(config, "/health"),
        {
          method: "GET",
          headers: createHermesGatewayAuthenticatedHeaders(config),
        },
      );

      return readJsonResponse(response);
    },

    async getAgentStatus() {
      const response = await fetchHermesGatewayWithTimeout(
        buildHermesGatewayUrl(config, "/agent/status"),
        {
          method: "GET",
          headers: createHermesGatewayAuthenticatedHeaders(config),
        },
      );

      return readJsonResponse(response);
    },
  };
}