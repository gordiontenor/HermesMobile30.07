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
import { parseHermesSseText } from "./hermesSseParser";

export type HermesStreamingParseResult = {
  chunks: string[];
  text: string;
  hasError: boolean;
  done: boolean;
};

export function parseHermesStreamingText(raw: string): HermesStreamingParseResult {
  const chunks: string[] = [];
  let hasError = false;
  let done = false;
  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") {
      done = true;
      break;
    }
    try {
      const frame: unknown = JSON.parse(payload);
      if (frame && typeof frame === "object" && (frame as { status?: unknown }).status === "error") {
        hasError = true;
        break;
      }
    } catch {
      continue;
    }
    const parsed = parseHermesSseText(`data: ${payload}`);
    chunks.push(...parsed);
  }
  return { chunks, text: chunks.join(""), hasError, done };
}

export async function sendLiveNoToolsChatMessage(
  config: HermesGatewaySetupConfig,
  payload: unknown,
  routingPayloadOrOnDelta?: HermesChatRoutingPayload | null | ((chunk: string) => void),
  onDelta?: (chunk: string) => void,
): Promise<HermesChatResponse> {
  const routingPayload = typeof routingPayloadOrOnDelta === "function" ? null : routingPayloadOrOnDelta;
  const deltaCallback = typeof routingPayloadOrOnDelta === "function" ? routingPayloadOrOnDelta : onDelta;
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
  const requestPayload = deltaCallback ? { ...finalPayload, stream: true } : finalPayload;

  let response: Response;
  try {
    response = await fetchHermesGatewayWithTimeout(
      buildHermesGatewayUrl(config, "/chat/message"),
      {
        method: "POST",
        headers: createHermesGatewayAuthenticatedHeaders(config, {
          includeJsonContentType: true,
        }),
        body: JSON.stringify(requestPayload),
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

  const contentType = response.headers.get("content-type") ?? "";
  if (deltaCallback && contentType.toLowerCase().includes("text/event-stream")) {
    const chunks: string[] = [];
    let hasError = false;
    let done = false;
    const consume = (raw: string) => {
      const parsedStream = parseHermesStreamingText(raw);
      for (const chunk of parsedStream.chunks) {
        chunks.push(chunk);
        deltaCallback(chunk);
      }
      hasError = parsedStream.hasError;
      done = parsedStream.done;
    };

    if (response.body?.getReader) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let readerDone = false;
      while (!readerDone && !hasError && !done) {
        const result = await reader.read();
        readerDone = result.done;
        if (result.value) {
          buffer += decoder.decode(result.value, { stream: !readerDone });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          consume(lines.join("\n"));
        }
      }
      if (buffer && !hasError) consume(buffer);
    } else {
      consume(await response.text());
    }

    return hasError
      ? { status: "unexpected_response", safeError: "Stream error" }
      : { status: "ok", text: chunks.join("") };
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
