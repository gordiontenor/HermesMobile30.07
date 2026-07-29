export type HermesChatRoutingPayload = {
  providerId?: string;
  modelId?: string;
};

export function createRoutingPayload(opts?: {
  provider?: string;
  model?: string;
}): HermesChatRoutingPayload | undefined {
  if (!opts?.provider && !opts?.model) return undefined;
  return {
    providerId: opts?.provider || undefined,
    modelId: opts?.model || undefined,
  };
}
