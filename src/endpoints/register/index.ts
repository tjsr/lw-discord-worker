import { DiscordExecutionContext, Env } from "../../types/index.js";

import CommandsEndpoint from "../commands.js";
import { DiscordApplication } from "@discord-interactions/core";
import RegisterHero from "./hero.js";
import RegisterRss from "./rss.js";
import Router from "../../utils/router.js";
import Setup from "../setup.js";
import { createDiscordApplication } from "../../createApplication.js";

export * from "./hero.js";

const configValues: Map<string, string> = new Map();
configValues.set("testValue", "some value here");

export default {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(request: Request, env: Env, ctx: DiscordExecutionContext): Promise<Response> {
    console.log("Going through register endpoint");
    const router = new Router(request);
    const app: DiscordApplication = createDiscordApplication();

    router.endpoint(new CommandsEndpoint(app));
    router.endpoint(new Setup(app, env.DB, configValues));
    router.endpoint(new RegisterHero(app, env.DB, configValues));
    router.endpoint(new RegisterRss(app, env.DB, configValues));

    const response = router.call(request, env, ctx);
    if (response) {
      return response;
    }
    return new Response("Unknown Error", { status: 500 });
  }
};
