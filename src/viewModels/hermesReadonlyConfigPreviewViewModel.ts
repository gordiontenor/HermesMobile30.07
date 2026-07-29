export type HermesReadonlyConfigPreviewAction = 
  | { type: "open_url"; url: string }
  | { type: "show_text"; text: string };

export type HermesReadonlyConfigPreviewViewModel = {
  maskedUrl: string;
  maskedUsername: string;
  actions: HermesReadonlyConfigPreviewAction[];
};

export function createHermesReadonlyConfigPreviewViewModel(config: {
  url?: string;
  username?: string;
}): HermesReadonlyConfigPreviewViewModel {
  return {
    maskedUrl: config.url ? config.url.replace(/https?:\/\//, "***://") : "not set",
    maskedUsername: config.username || "not set",
    actions: [],
  };
}
