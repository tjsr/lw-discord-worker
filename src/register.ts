import { Env } from "./types/index.js";
import register from "./endpoints/register";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return register.fetch(request, env, ctx);
  }
};
