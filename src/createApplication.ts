import { DiscordApplication, DiscordApplicationOptions, SyncMode } from "@discord-interactions/core";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDiscordApplication = (clientId: string, token: string, publicKey: string, cache: Map<string, any>, syncMode: SyncMode = SyncMode.Disabled) => {
  if (syncMode !== SyncMode.Disabled) {
    console.warn(`SyncMode is ${syncMode === SyncMode.Strict ? "strict" : "enabled"} - commands will be updated!`);
  }
  const applicationOptions: DiscordApplicationOptions = {
    clientId: clientId,
    token: token,
    publicKey: publicKey,

    cache: {
      get: async (key: string) => cache.get(key),
      set: async (key: string, ttl: number, value: string) => {
        cache.set(key, value);
      }
    },

    syncMode: syncMode,
  };
  const app = new DiscordApplication(applicationOptions);
  return app;
};