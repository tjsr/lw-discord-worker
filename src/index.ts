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
import { Ping } from "./commands/Ping.js";

export interface Env {
  CLIENT_ID: string;
  TOKEN: string;
  PUBLIC_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const cache = new Map();

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

    await app.commands.register(new Ping());

    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");

    const body = await request.text();

    if (typeof body !== "string" || typeof signature !== "string" || typeof timestamp !== "string") {
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
        return new Response("Invalid request", { status: 401 });
      }

      if (err instanceof InteractionHandlerNotFound) {
        console.error("Interaction Handler Not Found:", err);

        new Response("Invalid request", { status: 404 });
      }

      if (err instanceof InteractionHandlerTimedOut) {
        console.error("Interaction Handler Timed Out");

        new Response("Timed Out", { status: 408 });
      }

      if (
        err instanceof UnknownInteractionType ||
        err instanceof UnknownApplicationCommandType ||
        err instanceof UnknownComponentType
      ) {
        console.error("Unknown Interaction - Library may be out of date.");

        new Response("Server Error", { status: 500 });
      }

      if (err instanceof InteractionHandlerError) {
        console.error("Interaction Handler Error: ", err);

        new Response("Server Error", { status: 500 });
      }

      console.error(err);
    }

    return new Response("Unknown Error", { status: 500 });
  }
};
