/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
  DiscordApplication,
  InteractionHandlerError,
  InteractionHandlerNotFound,
  InteractionHandlerTimedOut,
  SyncMode,
  UnauthorizedInteraction,
  UnknownApplicationCommandType,
  UnknownComponentType,
  UnknownInteractionType
} from "@discord-interactions/core";

import CommandsEndpoint from "./endpoints/commands";
import { Env } from "./types";
import FileEndpoint from "./endpoints/file.js";
import Router from "./utils/router";
import Setup from "./endpoints/setup";
import { commandList } from "./commands";
import { createDiscordApplication } from "./createApplication.js";
import dbtest from "./dbtest";
import settings from "./utils/discordSettings";

// import LWConfig from "./commands/lwconfig";
// import Ping from "./commands";

// if (
//   process.env["CLIENT_ID"] !== undefined &&
//   process.env["TOKEN"] !== undefined &&
//   process.env["PUBLIC_KEY"] !== undefined
// ) {
//   globalApp = createDiscordApplication(process.env.CLIENT_ID, process.env.TOKEN, process.env.PUBLIC_KEY, cache);
//   await deleteLaunchCommands(globalApp);
// }

const configValues: Map<string, string> = new Map();
configValues.set("testValue", "some value here");

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const router = new Router(request);
    settings({
      clientId: env.CLIENT_ID,
      token: env.TOKEN,
      publicKey: env.PUBLIC_KEY
    });

    if (router.matchesRoute("/setup")) {
      settings({ syncMode: SyncMode.Enabled });
    }

    if (new URL(request.url).pathname === "/dbtest") {
      return dbtest.fetch(request, env, ctx);
    }
    // console.log(`Got index request to ${request.url}`);
    // const setup = new Setup("/setup");
    // setup.isRoute(request);

    const app: DiscordApplication = createDiscordApplication();

    router.endpoint(new CommandsEndpoint(app));
    router.endpoint(new Setup(app, configValues));

    const response = router.call(request, env, ctx);
    if (response) {
      return response;
    }

    // if (setup.isRoute(request) || commands.isRoute(request)) {
    //   await commands.listAvailableCommands();
    // }

    try {
      const commands = commandList(env.DB, configValues);
      await app.commands.register(...commands);
    } catch (error) {
      console.error("Error registering commands: ", error);
      return new Response(JSON.stringify({ success: false }), {
        headers: {
          "content-type": "application/json;charset=UTF-8"
        },
        status: 500
      });
    }

    // if (setup.isRoute(request) || commands.isRoute(request)) {
    //   await commands.listRegisteredCommands(registeredCommands);
    //   await commands.listPostCommands();
    // }

    // if (commands.isRoute(request)) {
    //   return commands.handle(request, env, ctx);
    // }

    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");

    const fileHandler: FileEndpoint = new FileEndpoint();
    if (fileHandler.isRoute(request)) {
      return fileHandler.handle(request, env, ctx);
    }

    // if (setup.isRoute(request)) {
    //   setup.commandStatuses = commands.commandStatuses;
    //   return setup.handle(request, env, ctx);
    // }

    const body = await request.text();
    if (typeof body !== "string" || typeof signature !== "string" || typeof timestamp !== "string") {
      console.log("Got a bad request");
      return new Response("Invalid request", { status: 400 });
    }

    try {
      const [getResponse, handling] = await app.handleInteraction(body, signature, timestamp);

      ctx.waitUntil(handling);
      const response = await getResponse;

      if (response instanceof FormData) {
        return new Response(response);
      }

      return new Response(JSON.stringify(response), {
        headers: {
          "content-type": "application/json;charset=UTF-8"
        }
      });
    } catch (err) {
      if (err instanceof UnauthorizedInteraction) {
        console.warn("Got unauthorised interaction:", err);
        return new Response("Invalid request", { status: 401 });
      }

      if (err instanceof InteractionHandlerNotFound) {
        console.error("Interaction Handler Not Found:", err);
        return new Response("Invalid request", { status: 404 });
      }

      if (err instanceof InteractionHandlerTimedOut) {
        console.error("Interaction Handler Timed Out");
        return new Response("Timed Out", { status: 408 });
      }

      if (
        err instanceof UnknownInteractionType ||
        err instanceof UnknownApplicationCommandType ||
        err instanceof UnknownComponentType
      ) {
        console.error("Unknown Interaction - Library may be out of date.");
        return new Response("Server Error", { status: 500 });
      }

      if (err instanceof InteractionHandlerError) {
        const iErr = err as InteractionHandlerError;
        const interactionCause = iErr.interaction;
        console.error("Interaction Handler Error: ", interactionCause.message, iErr.message, err);
        return new Response("Server Error", { status: 500 });
      }

      console.error(err);
    }

    return new Response("Unknown Error", { status: 500 });
  }
};
