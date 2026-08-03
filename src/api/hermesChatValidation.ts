export function parseChatRequest(payload: unknown): { message: string; apiKey?: string; model?: string; provider?: string; stream?: boolean } | { status: "validation_error"; safeError: string } {
  if (!payload || typeof payload !== "object") {
    return { status: "validation_error", safeError: "Invalid payload" };
  }
  const p = payload as any;
  if (typeof p.message === "string" && p.message.trim()) {
    return { message: p.message, apiKey: p.apiKey, model: p.model, provider: p.provider, stream: p.stream };
  }
  // Accept 'text' field as fallback
  if (typeof p.text === "string" && p.text.trim()) {
    return { message: p.text, apiKey: p.apiKey, model: p.model, provider: p.provider, stream: p.stream };
  }
  return { status: "validation_error", safeError: "Missing message" };
}

export type ParsedChatResponse = 
  | { status: "ok"; text: string }
  | { status: "validation_error"; safeError: string }
  | { status: "upstream_unavailable"; safeError: string }
  | { status: "timeout"; safeError: string }
  | { status: "unexpected_response"; safeError: string };

export function parseChatResponse(json: unknown): ParsedChatResponse {
  if (!json || typeof json !== "object") {
    return { status: "unexpected_response", safeError: "Invalid response" };
  }
  const j = json as any;
  // Gateway returns { status: "ok", assistantText: "..." }
  if (j.status === "ok" && typeof j.assistantText === "string") {
    return { status: "ok", text: j.assistantText };
  }
  // Fallback: check for 'text' field
  if (typeof j.text === "string") {
    return { status: "ok", text: j.text };
  }
  // Gateway validation error
  if (j.status === "validation_error" && typeof j.safeError === "string") {
    return { status: "validation_error", safeError: j.safeError };
  }
  // Gateway upstream/provider errors (503 etc.) — pass through so the UI can
  // show a meaningful message instead of a generic "unexpected response".
  if (j.status === "upstream_unavailable" && typeof j.safeError === "string") {
    return { status: "upstream_unavailable", safeError: j.safeError };
  }
  if (j.status === "timeout" && typeof j.safeError === "string") {
    return { status: "timeout", safeError: j.safeError };
  }
  return { status: "unexpected_response", safeError: "Missing text field" };
}
