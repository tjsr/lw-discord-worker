import { DiscordExecutionContext, Env, Handler } from "../types";

import Endpoint from "../endpoints";

export interface Route {
  route: string | RegExp;
  handler: Handler;
}

export default class Router {
  constructor(request: Request) {
    this._routes = [];
    this._endpoints = [];
    this._request = request;
  }

  private _routes: Route[];
  private _endpoints: Endpoint[];
  private _request: Request;

  public endpoint(...e: Endpoint[]): void {
    e.forEach((endpoint) => {
      this._endpoints.push(endpoint);
    });
  }

  public to(route: string | RegExp, handler: Handler): void {
    this._routes.push({ route, handler });
  }

  public call(request: Request, env: Env, ctx: DiscordExecutionContext): Promise<Response> | undefined {
    const endpoint = this._endpoints.find((e) => e.isRoute(request));

    if (endpoint) {
      console.debug(`handler ${endpoint.getClassName()} endpoint request from Router at ${Endpoint.getPath(request)}.`);
      return endpoint.handle(request, env, ctx);
    }

    const route = this._routes.find((r) => {
      const pathname = Endpoint.getPath(request);
      if (r.route instanceof RegExp) {
        return r.route.test(pathname);
      }
      return r.route === pathname;
    });

    if (route) {
      console.log("Called route request from Router.");
      try {
        return route.handler(request, env, ctx);
      } catch (err) {
        console.log(`Failed to handle route request: ${err}`, err);
        return Promise.resolve(new Response("Internal Server Error", { status: 500 }));
      }
    }

    return undefined;
  }

  public isSetupEndpoint(request: Request): boolean {
    const endpoint = this._endpoints.find((e) => e.isRoute(request));
    if (!endpoint) {
      return false;
    }
    return endpoint.requiresSync;
  }

  public matchesRoute(path: string | RegExp): boolean {
    const { pathname } = new URL(this._request.url);
    const matchesPath = path instanceof RegExp ? path.test(pathname) : pathname === path;
    return matchesPath;
  }
}
