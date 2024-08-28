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
import { DiscordExecutionContext } from "./types";
import { Env } from "./types";
import FileEndpoint from "./endpoints/file.js";
import RegisterHero from "./endpoints/register/hero";
import RegisterRss from "./endpoints/register/rss";
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

const handleInteractionError = (err: unknown): Response | undefined => {
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
};

const allowSync = true;

export default {
  async fetch(request: Request, env: Env, ctx: DiscordExecutionContext): Promise<Response> {
    console.debug(`Got index request to ${request.url}`);

    ctx.router = new Router(request);
    settings({
      clientId: env.CLIENT_ID,
      token: env.TOKEN,
      publicKey: env.PUBLIC_KEY
    });

    if (ctx.router.matchesRoute("/setup")) {
      if (allowSync) {
        settings({ syncMode: SyncMode.Enabled });
      }
    }
    if (allowSync && (ctx.router.matchesRoute("/setup") || ctx.router.matchesRoute(/\/register\/.*/))) {
      settings({ syncMode: SyncMode.Enabled });
    }

    ctx.discordApp = createDiscordApplication();

    if (ctx.router.matchesRoute("/setup")) {
      ctx.router.endpoint(new Setup(ctx.discordApp, env.DB, configValues));
    } else if (ctx.router.matchesRoute(/\/register\/.*/)) {
      ctx.router.endpoint(new RegisterHero(ctx.discordApp, env.DB, configValues));
      ctx.router.endpoint(new RegisterRss(ctx.discordApp, env.DB, configValues));
      // } else if (new URL(request.url).pathname === "/dbtest") {
      //   return dbtest.fetch(request, env, ctx);
    } else {
      ctx.router.to("/dbtest", dbtest.fetch);
      ctx.router.endpoint(new CommandsEndpoint(ctx.discordApp));
    }

    const response = ctx.router.call(request, env, ctx);
    if (response) {
      return response;
    }

    const commands = commandList(env.DB, configValues);
    let failed = false;

    commands.forEach(async (command) => {
      await ctx.discordApp.commands.register(command).catch((error) => {
        console.error(`Error registering command ${command.builder.name}: `, error);
        failed = true;
      });
    });

    if (failed) {
      console.error("One or more commands failed to register, see previous errors.");
      return new Response(JSON.stringify({ success: false }), {
        headers: {
          "content-type": "application/json;charset=UTF-8"
        },
        status: 500
      });
    }

    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");

    const fileHandler: FileEndpoint = new FileEndpoint();
    if (fileHandler.isRoute(request)) {
      return fileHandler.handle(request, env, ctx);
    }

    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const body = await request.text();

    const checkContent = (...checkedValues: string[]): Response | undefined => {
      if (checkedValues.some((value) => typeof value !== "string")) {
        return new Response("Invalid request", { status: 400 });
      }
      return undefined;
    };

    const contentCheckErrorMessage: Response | undefined = checkContent(body, signature, timestamp);
    if (contentCheckErrorMessage) {
      return contentCheckErrorMessage;
    }

    if (typeof body !== "string") {
      console.log("Got a bad request - request body is not a string.", JSON.stringify(body));
      return new Response("Invalid request", { status: 400 });
    }
    if (typeof signature !== "string") {
      console.log("Got a bad request - signature is not a string", JSON.stringify(body));
      return new Response("Invalid request", { status: 400 });
    }
    if (typeof timestamp !== "string") {
      console.log("Got a bad request - timestamp is not a string", JSON.stringify(body));
      return new Response("Invalid request", { status: 400 });
    }

    if (typeof body !== "string" || typeof signature !== "string" || typeof timestamp !== "string") {
      console.log("Got a bad request", JSON.stringify(body));
      return new Response("Invalid request", { status: 400 });
    }

    try {
      const [getResponse, handling] = await ctx.discordApp.handleInteraction(body, signature, timestamp);

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
      const errorResponse: Response | undefined = handleInteractionError(err);
      if (errorResponse) {
        return errorResponse;
      }

      console.error(err);
    }

    return new Response("Unknown Error", { status: 500 });
  }
};
