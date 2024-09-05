import { DiscordApplication, SyncMode } from "@discord-interactions/core";
import { DiscordExecutionContext, Env } from "./types";

import CommandsEndpoint from "./endpoints/commands";
import { createDiscordApplication } from "./createApplication";
import { getCache } from "./utils/cache";

const cacheMap = new Map();
const cache = getCache("map", cacheMap);

export default {
  async fetch(request: Request, env: Env, ctx: DiscordExecutionContext): Promise<Response> {
    const app: DiscordApplication = createDiscordApplication({
      clientId: env.CLIENT_ID,
      token: env.TOKEN,
      publicKey: env.PUBLIC_KEY,
      cache: cache,
      syncMode: SyncMode.Disabled
    });

    const commands: CommandsEndpoint = new CommandsEndpoint(app);

    console.log(`Got request via command route ${request.url}`);
    return commands.handle(request, env, ctx);
  }
};

