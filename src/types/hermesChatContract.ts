export type HermesChatResponse = 
  | { status: "ok"; text: string }
  | { status: "validation_error"; safeError: string }
  | { status: "upstream_unavailable"; safeError: string }
  | { status: "timeout"; safeError: string }
  | { status: "unexpected_response"; safeError: string };

export type HermesChatRequest = {
  text: string;
  model?: string;
  provider?: string;
};
