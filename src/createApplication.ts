import { DiscordApplication, DiscordApplicationOptions, SyncMode } from "@discord-interactions/core";

import { settings } from "./utils/discordSettings";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDiscordApplication = (options?: Partial<DiscordApplicationOptions>) => {
  const applicationOptions: DiscordApplicationOptions = settings(options);
  const syncMode = applicationOptions.syncMode;
  if (syncMode !== SyncMode.Disabled) {
    console.log(`SyncMode is ${syncMode === SyncMode.Strict ? "strict" : "enabled"} - commands will be updated!`);
  }
  const app = new DiscordApplication(applicationOptions);
  return app;
};