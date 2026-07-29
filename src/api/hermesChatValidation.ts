export function parseChatRequest(payload: unknown): { text: string } | { status: "validation_error"; safeError: string } {
  if (!payload || typeof payload !== "object") {
    return { status: "validation_error", safeError: "Invalid payload" };
  }
  const p = payload as any;
  if (typeof p.text !== "string" || !p.text.trim()) {
    return { status: "validation_error", safeError: "Missing text" };
  }
  return { text: p.text };
}

export type ParsedChatResponse = 
  | { status: "ok"; text: string }
  | { status: "validation_error"; safeError: string }
  | { status: "unexpected_response"; safeError: string };

export function parseChatResponse(json: unknown): ParsedChatResponse {
  if (!json || typeof json !== "object") {
    return { status: "unexpected_response", safeError: "Invalid response" };
  }
  const j = json as any;
  if (typeof j.text === "string") {
    return { status: "ok", text: j.text };
  }
  return { status: "unexpected_response", safeError: "Missing text field" };
}
