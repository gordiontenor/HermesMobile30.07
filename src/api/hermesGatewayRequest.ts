import type { HermesGatewaySetupConfig } from "../viewModels/hermesGatewaySetupViewModel";
import { createHermesReadonlyGatewayTransportError } from "./hermesReadonlyGatewayTransportError";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function btoaSafe(input: string = ""): string {
  let str = input;
  let output = "";

  for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = "=", i % 1);
    output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))) {
    charCode = str.charCodeAt((i += 3 / 4));
    if (charCode > 0xff) {
      throw new Error(
        "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.",
      );
    }
    block = (block << 8) | charCode;
  }

  return output;
}

export function normalizeHermesGatewayUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function buildHermesGatewayUrl(
  config: HermesGatewaySetupConfig,
  route: `/${string}`,
): string {
  return `${normalizeHermesGatewayUrl(config.url)}${route}`;
}

export function createHermesGatewayAuthenticatedHeaders(
  config: HermesGatewaySetupConfig,
  options?: {
    includeJsonContentType?: boolean;
  },
): Record<string, string> {
  try {
    const token = btoaSafe(`${config.username}:${config.password}`);
    return {
      Authorization: `Basic ${token}`,
      Accept: "application/json",
      ...(options?.includeJsonContentType
        ? { "Content-Type": "application/json" }
        : {}),
    };
  } catch {
    throw createHermesReadonlyGatewayTransportError("network_failed");
  }
}

export async function fetchHermesGatewayWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 12000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error: unknown) {
    const err = error as { name?: string; type?: string };
    if (err.name === "AbortError" || err.type === "aborted") {
      throw createHermesReadonlyGatewayTransportError("network_timeout");
    }

    throw createHermesReadonlyGatewayTransportError("network_failed");
  } finally {
    clearTimeout(id);
  }
}
