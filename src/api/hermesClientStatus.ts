export type HermesClientInfo = {
  mode: string;
  gatewayConfigured: boolean;
  liveTransportEnabled: boolean;
};

export function describeHermesClientInfo(info: HermesClientInfo): string {
  const parts = [];
  parts.push(`Mode: ${info.mode}`);
  if (info.gatewayConfigured) parts.push("Gateway configured");
  if (info.liveTransportEnabled) parts.push("Live transport enabled");
  return parts.join(" | ");
}
