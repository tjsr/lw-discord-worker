import { Env, Handler } from "../types";

import Endpoint from "../endpoints";

export default class Router {
  constructor(request: Request) {
    this._routes = [];
    this._endpoints = [];
    this._request = request;
  }

  private _routes: {route, handler}[];
  private _endpoints: Endpoint[];
  private _request: Request;

  public endpoint(e: Endpoint):void {
    this._endpoints.push(e);
  }
  public to(route: string|RegExp, handler: Handler): void {
    this._routes.push({ route, handler });
  }

  public call(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>|undefined {
    const endpoint = this._endpoints.find((e) => e.isRoute(request));

    if (endpoint) {
      console.log(`handler ${endpoint.getClassName()} endpoint request from Router.`);
      return endpoint.handle(request, env, ctx);
    }

    const route = this._routes.find((r) => {
      if (r.route instanceof RegExp) {
        return r.route.test(new URL(request.url).pathname);
      }
      return r.route === new URL(request.url).pathname;
    });

    if (route) {
      console.log('Called route request from Router.')
      return route.handler(request, env, ctx);
    }

    return undefined;
  }

  public matchesRoute(path: string|RegExp): boolean {
    const { pathname } = new URL(this._request.url);
    const matchesPath = path instanceof RegExp ? path.test(pathname) : pathname === path;
    return matchesPath;
  }
}
