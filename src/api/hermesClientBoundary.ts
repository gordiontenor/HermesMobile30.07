export type HermesClientBoundaryMode = "disabled" | "readonly" | "live";

export type HermesClientBoundaryConfig = {
  mode: HermesClientBoundaryMode;
  gatewayConfigured: boolean;
  liveTransportEnabled: boolean;
};

export function createHermesClientBoundary(
  config: HermesClientBoundaryConfig
) {
  return {
    mode: config.mode,
    gatewayConfigured: config.gatewayConfigured,
    liveTransportEnabled: config.liveTransportEnabled,
    getInfo: () => ({
      mode: config.mode,
      gatewayConfigured: config.gatewayConfigured,
      liveTransportEnabled: config.liveTransportEnabled,
    }),
  };
}
