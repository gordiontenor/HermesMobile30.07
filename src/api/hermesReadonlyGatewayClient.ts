export type HermesReadonlyGatewayTransport = HermesReadonlyGatewayClient;

export interface HermesReadonlyGatewayClient {
  getInfo?: () => { url?: string; connected: boolean };
  connect?: (url: string) => Promise<boolean>;
  disconnect?: () => void;
  [key: string]: any;
}

export function createHermesReadonlyGatewayClient(): HermesReadonlyGatewayClient {
  let url: string | undefined;
  return {
    getInfo: () => ({ url, connected: !!url }),
    connect: async (u: string) => { url = u; return true; },
    disconnect: () => { url = undefined; },
  };
}
