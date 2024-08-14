import { Env, Handler } from "../types";

export default class Endpoint {
  private handler: Handler;
  private path: string|RegExp;

  constructor(path: string|RegExp, handler: Handler) {
    this.path = path;
    this.handler = handler;
  }

  public async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return this.handler(request, env, ctx);
  }

  public isRoute(request: Request): boolean {
    const { pathname } = new URL(request.url);
    const matchesPath = this.path instanceof RegExp ? this.path.test(pathname) : pathname === this.path;
    return matchesPath;
  }
}
