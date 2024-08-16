import { Env, Handler } from "../types";

export default class Endpoint {
  private _handler: Handler;
  private _path: string|RegExp;
  private _name: string;

  constructor(path: string|RegExp, handler: Handler) {
    this._path = path;
    this._handler = handler;
    this._name = this.constructor.name;
  }

  public async handle(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return this._handler(request, env, ctx);
  }

  public isRoute(request: Request): boolean {
    const { pathname } = new URL(request.url);
    const matchesPath = this._path instanceof RegExp ? this._path.test(pathname) : pathname === this._path;
    return matchesPath;
  }

  public getClassName(): string {
    return this._name;
  }
}
