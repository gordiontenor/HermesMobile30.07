export function parseHermesSseText(raw: string): string[] {
  const deltas: string[] = [];

  for (const line of raw.split(/\r?\n/)) {
    if (!line.startsWith("data:")) {
      continue;
    }

    const payload = line.slice("data:".length).trim();
    if (payload === "[DONE]") {
      break;
    }

    try {
      const parsed: unknown = JSON.parse(payload);
      if (!parsed || typeof parsed !== "object") {
        continue;
      }

      const choices = (parsed as { choices?: unknown }).choices;
      if (!Array.isArray(choices) || choices.length === 0) {
        continue;
      }

      const firstChoice = choices[0];
      if (!firstChoice || typeof firstChoice !== "object") {
        continue;
      }

      const delta = (firstChoice as { delta?: unknown }).delta;
      if (!delta || typeof delta !== "object") {
        continue;
      }

      const content = (delta as { content?: unknown }).content;
      if (typeof content === "string") {
        deltas.push(content);
      }
    } catch {
      // Ignore malformed SSE data lines.
    }
  }

  return deltas;
}
