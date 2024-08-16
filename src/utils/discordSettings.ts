import { DiscordApplicationOptions, SyncMode } from "@discord-interactions/core";

const cache = new Map();

const defaultSettings = {
  cache: {
    get: async (key: string) => cache.get(key),
    set: async (key: string, ttl: number, value: string) => {
      cache.set(key, value);
    }
  },
  syncMode: SyncMode.Disabled,
} as DiscordApplicationOptions;


let currentSettings: DiscordApplicationOptions = {
  ...defaultSettings
};

export const settings = (overrides?: Partial<DiscordApplicationOptions>): DiscordApplicationOptions => {
  currentSettings = {
    ...currentSettings,
    ...overrides
  } as DiscordApplicationOptions;
  return currentSettings;
};

export default settings;
