import { DiscordApplication, SyncMode } from "@discord-interactions/core";

import CommandsEndpoint from "./endpoints/commands";
import { Env } from "./types";
import { createDiscordApplication } from "./createApplication";

const cache = new Map();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const app: DiscordApplication =
      createDiscordApplication(
        env.CLIENT_ID,
        env.TOKEN,
        env.PUBLIC_KEY,
        cache,
        SyncMode.Disabled
      );

    const commands: CommandsEndpoint = new CommandsEndpoint(app);
    
    console.log(`Got request via command route ${request.url}`);
    return commands.handle(request, env, ctx);
  }
}

