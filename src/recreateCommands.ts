import { DiscordApplication, SyncMode } from "@discord-interactions/core";

const cache = new Map();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env: any = process.env;

const app = new DiscordApplication({
  clientId: env.CLIENT_ID,
  token: env.TOKEN,
  publicKey: env.PUBLIC_KEY,

  cache: {
    get: async (key: string) => cache.get(key),
    set: async (key: string, ttl: number, value: string) => {
      cache.set(key, value);
    }
  },

  syncMode: SyncMode.Disabled
});

const commands = await app.rest.getApplicationCommands(app.clientId);
console.log(`Commands: ${commands.length}`);
commands
  .filter((command) => ![1, 2, 3].includes(command.type))
  .forEach(async (command) => {
    console.log(`Deleting command: ${command.id} ${command.name}`);
    const deleted = await app.rest.deleteApplicationCommand(app.clientId, command.id);
    console.log("Deleted command:", deleted);
  });
