export type HermesConnectionReadiness = {
  ready: boolean;
  reason?: string;
};

export function createHermesConnectionReadinessViewModel(config: {
  url?: string;
  username?: string;
  password?: string;
}): HermesConnectionReadiness {
  if (!config.url) return { ready: false, reason: "No gateway URL" };
  if (!config.username) return { ready: false, reason: "No username" };
  if (!config.password) return { ready: false, reason: "No password" };
  return { ready: true };
}
